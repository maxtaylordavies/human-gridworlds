#include "GriddlyJSGameWrapper.hpp"

#include <emscripten/val.h>

#include <memory>

#include "GriddlyJSWrapperCommon.cpp"

namespace e = emscripten;

GriddlyJSGameWrapper::GriddlyJSGameWrapper(std::string globalObserverName, std::shared_ptr<griddly::GDYFactory> gdyFactory) : gdyFactory_(gdyFactory) {
  std::shared_ptr<griddly::Grid> grid = std::make_shared<griddly::Grid>(griddly::Grid());
  gameProcess_ = std::make_shared<griddly::TurnBasedGameProcess>(griddly::TurnBasedGameProcess(globalObserverName, gdyFactory, grid));
  spdlog::debug("Created game process wrapper");
}

std::shared_ptr<griddly::TurnBasedGameProcess> GriddlyJSGameWrapper::unwrapped() {
  return gameProcess_;
}

std::shared_ptr<GriddlyJSPlayerWrapper> GriddlyJSGameWrapper::registerPlayer(std::string playerName, std::string observerName) {
  auto nextPlayerId = ++playerCount_;
  auto observer = gdyFactory_->createObserver(gameProcess_->getGrid(), observerName, gdyFactory_->getPlayerCount(), nextPlayerId);

  auto player = std::make_shared<GriddlyJSPlayerWrapper>(GriddlyJSPlayerWrapper(nextPlayerId, playerName, observer, gdyFactory_, gameProcess_));
  players_.push_back(player);
  gameProcess_->addPlayer(player->unwrapped());
  return player;
}

const uint32_t GriddlyJSGameWrapper::getActionTypeId(std::string actionName) const {
  auto actionNames = gdyFactory_->getExternalActionNames();
  for (int i = 0; i < actionNames.size(); i++) {
    if (actionNames[i] == actionName) {
      return i;
    }
  }
  throw std::runtime_error("unregistered action");
}

void GriddlyJSGameWrapper::init() {
  gameProcess_->init(false);
}

void GriddlyJSGameWrapper::release() {
  gameProcess_->release();
}

void GriddlyJSGameWrapper::loadLevel(uint32_t levelId) {
  gameProcess_->setLevel(levelId);
}

void GriddlyJSGameWrapper::loadLevelString(std::string levelString) {
  gameProcess_->setLevel(levelString);
}

void GriddlyJSGameWrapper::reset() {
  gameProcess_->reset();
}

e::val GriddlyJSGameWrapper::getGlobalObservationDescription() const {
  return wrapObservationDescription(gameProcess_->getObserver());
}

e::val GriddlyJSGameWrapper::observe() {
  return wrapObservation(gameProcess_->getObserver());
}

e::val GriddlyJSGameWrapper::stepParallel(e::val stepArray) {
  const auto& externalActionNames = gdyFactory_->getExternalActionNames();

  auto playerSize = stepArray["length"].as<uint32_t>();

  if (playerSize != playerCount_) {
    auto error = fmt::format("The number of players {0} does not match the first dimension of the parallel action.", playerCount_);
    spdlog::error(error);
    throw std::invalid_argument(error);
  }

  e::val playerRewards = e::val::array();
  bool terminated = false;
  e::val info = e::val::object();

  for (int p = 0; p < playerSize; p++) {
    auto playerStepArray = e::convertJSArrayToNumberVector<int32_t>(stepArray.call<e::val>("at", p));
    auto actionSize = playerStepArray.size();

    std::vector<int32_t> actionArray;

    std::string actionName;
    switch (actionSize) {
      case 1:
        actionName = externalActionNames.at(0);
        break;
      case 2:
        actionName = externalActionNames.at(playerStepArray[0]);
        actionArray.push_back(playerStepArray[1]);
        break;
      case 3:
        actionName = externalActionNames.at(0);
        actionArray.push_back(playerStepArray[0]);
        actionArray.push_back(playerStepArray[1]);
        actionArray.push_back(playerStepArray[2]);
        break;
      case 4:
        actionName = externalActionNames.at(playerStepArray[2]);
        actionArray.push_back(playerStepArray[0]);
        actionArray.push_back(playerStepArray[1]);
        actionArray.push_back(playerStepArray[3]);
        break;
      default: {
        auto error = fmt::format("Invalid action size, {0}", actionSize);
        spdlog::error(error);
        throw std::invalid_argument(error);
      }
    }

    bool lastPlayer = p == (playerSize - 1);

    spdlog::debug("Player {0} action size: {1}, action: {2}", p, actionSize, actionName);

    auto playerStepResult = players_[p]->stepSingle(actionName, actionArray, lastPlayer);
    if (lastPlayer) {
      terminated = playerStepResult["terminated"].as<bool>();
      info = playerStepResult["info"];
    }
  }

  for (int p = 0; p < playerSize; p++) {
    playerRewards.call<void>("push", gameProcess_->getAccumulatedRewards(p + 1));
  }

  auto js_result = e::val::object();

  js_result.set("terminated", terminated);
  js_result.set("info", info);
  js_result.set("reward", playerRewards);

  return js_result;
}

uint32_t GriddlyJSGameWrapper::getWidth() const {
  return gameProcess_->getGrid()->getWidth();
}

uint32_t GriddlyJSGameWrapper::getHeight() const {
  return gameProcess_->getGrid()->getHeight();
}

e::val GriddlyJSGameWrapper::getState() const {
  e::val js_state = e::val::object();
  auto state = gameProcess_->getState();

  js_state.set("gameTicks", state.gameTicks);
  js_state.set("hash", state.hash);

  e::val js_globalVariables = e::val::object();
  for (auto varIt : state.globalVariables) {
    e::val js_globalVarValues = e::val::object();
    for (auto valIt : varIt.second) {
      js_globalVarValues.set(valIt.first, valIt.second);
    }
    js_globalVariables.set(varIt.first, js_globalVarValues);
  }

  js_state.set("globalVariables", js_globalVariables);

  std::vector<e::val> objects_js{};
  for (auto objectInfo : state.objectInfo) {
    e::val js_objectInfo = e::val::object();
    e::val js_objectVariables = e::val::object();
    for (auto varIt : objectInfo.variables) {
      js_objectVariables.set(varIt.first, varIt.second);
    }

    js_objectInfo.set("id", objectInfo.id);
    js_objectInfo.set("name", objectInfo.name);
    js_objectInfo.set("location", objectInfo.location);
    js_objectInfo.set("zidx", objectInfo.zidx);
    js_objectInfo.set("orientation", objectInfo.orientationName);
    js_objectInfo.set("playerId", objectInfo.playerId);
    js_objectInfo.set("renderTileId", objectInfo.renderTileId);
    js_objectInfo.set("variables", js_objectVariables);

    objects_js.push_back(js_objectInfo);
  }

  js_state.set("objects", e::val::array(objects_js));

  return js_state;
}

std::vector<std::string> GriddlyJSGameWrapper::getGlobalVariableNames() const {
  std::vector<std::string> globalVariableNames;
  auto globalVariables = gameProcess_->getGrid()->getGlobalVariables();

  for (auto globalVariableIt : globalVariables) {
    globalVariableNames.push_back(globalVariableIt.first);
  }
  return globalVariableNames;
}

e::val GriddlyJSGameWrapper::getObjectVariableMap() const {
  auto test2 = e::val::object();
  auto test = e::val::object();
  test2.set("x", 5);

  test.set("X", test2);

  return test;
}

e::val GriddlyJSGameWrapper::getGlobalVariables(std::vector<std::string> variables) {
  e::val js_globalVariables = e::val::object();
  auto globalVariables = gameProcess_->getGrid()->getGlobalVariables();

  for (auto variableName : variables) {
    e::val js_resolvedGlobalVariableMap = e::val::object();

    auto globalVariableMap = globalVariables[variableName];

    for (auto playerVariableIt : globalVariableMap) {
      js_resolvedGlobalVariableMap.set(playerVariableIt.first, *playerVariableIt.second);
    }

    js_globalVariables.set(variableName, js_resolvedGlobalVariableMap);
  }
  return js_globalVariables;
}

std::vector<std::string> GriddlyJSGameWrapper::getObjectNames() {
  return gameProcess_->getGrid()->getObjectNames();
}

std::vector<std::string> GriddlyJSGameWrapper::getObjectVariableNames() {
  return gameProcess_->getGrid()->getAllObjectVariableNames();
}

void GriddlyJSGameWrapper::seedRandomGenerator(uint32_t seed) {
  gameProcess_->seedRandomGenerator(seed);
}