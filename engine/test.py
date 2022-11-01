import gym
from gym.utils.play import play
from griddly import GymWrapperFactory


def __main__():
    # wrapper = GymWrapperFactory()
    # wrapper.build_gym_from_yaml("SokobanTutorial", "./sokoban.yaml", level=0)
    # env = gym.make(f"GDY-SokobanTutorial-v0")
    env = gym.make("GDY-Sokoban-v0")
    # env.reset()
    play(env, fps=10, zoom=2)


if __name__ == "__main__":
    __main__()
