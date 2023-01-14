import collections
import csv
import json
from os import path, listdir

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import chisquare, chi2
import seaborn as sns
from sklearn.linear_model import LogisticRegression, LinearRegression

# ------------------------------------------------------------
# CONSTANTS
# ------------------------------------------------------------
AGENT_TRAJECTORIES = [
    {
        0: "1,1,1,1,1,1,1,1,1,1,1,1",
        1: "3,3,3,3,3,3,3,3,3,3,3,3",
        2: "2,2,2,2,2,2,2,2,2,2,2,2",
        3: "4,4,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2",
        4: "4,4,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2",
        5: "1,1,1,1,1,1,1,1,1,1,1,1",
        6: "3,3,3,3,3,3,3,3,3,3,3,3",
    },
    {
        0: "2,2,2,2,2,2,2,2,2,2,2,2",
        1: "1,1,1,1,1,1,1,1,1,1,1,1",
        2: "3,3,3,3,3,3,3,3,3,3,3,3",
        3: "4,4,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2",
        4: "4,4,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2",
        5: "3,3,3,3,3,3,3,3,3,3,3,3",
        6: "1,1,1,1,1,1,1,1,1,1,1,1",
    },
]
GRID_SIZES = [
    (14, 25),
    (14, 25),
    (14, 25),
    (15, 19),
    (15, 19),
    (14, 25),
    (14, 25),
]
START_POSITIONS = [(12, 12), (12, 12), (12, 12), (5, 9), (5, 9), (6, 12), (6, 12)]
MOVE_MAP = {"1": [0, -1], "2": [-1, 0], "3": [0, 1], "4": [1, 0]}
DATA_DIR = "../../data"
SESSION_DIR = path.join(DATA_DIR, "sessions")
TRAJECTORY_DIR = path.join(DATA_DIR, "trajectories")


# ------------------------------------------------------------
# HELPER FUNCTIONS
# ------------------------------------------------------------
def logValue(msg, val):
    print(f"{msg}: {val}")


def loadJSON(fp):
    with open(fp) as f:
        data = json.load(f)
    return data


def writeDictToCSV(data, fp):
    with open(fp, "w") as f:
        writer = csv.DictWriter(f, fieldnames=data.keys())
        writer.writeheader()
        writer.writerow(data)


def convertPathToCoords(path, startPos=(0, 0)):
    coords = [startPos]
    for move in path.split(","):
        coords.append(
            (coords[-1][0] + MOVE_MAP[move][0], coords[-1][1] + MOVE_MAP[move][1])
        )
    return coords


def distanceBetweenPaths(path1, path2, type="avg"):
    # convert path strings to lists of positions
    coords1, coords2 = convertPathToCoords(path1), convertPathToCoords(path2)

    # if one is shorter, pad it
    diff = len(coords2) - len(coords1)
    if diff > 0:
        coords1 += [coords1[-1]] * diff
    elif diff < 0:
        coords2 += [coords2[-1]] * -diff

    # compute euclidean distance for each point along the paths
    dist = lambda p1, p2: ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5
    distances = [dist(coords1[i], coords2[i]) for i in range(len(coords1))]

    operator = max if type == "max" else lambda x: sum(x) / len(x)
    return operator(distances)


def computeDominantDirection(path):
    counts = collections.Counter(path.replace(",", ""))
    return max(counts, key=counts.get)


def simCont(path1, path2):
    """
    returns exp(-d), where d is the mean distance between the two paths
    """
    return np.exp(-distanceBetweenPaths(path1, path2))


def simBin(path1, path2):
    """
    returns 1 if path1 and path2 have the same dominant direction, otherwise 0
    """
    return int(computeDominantDirection(path1) == computeDominantDirection(path2))


def loadSessions(experimentIDs=[]):
    experimentFilter = (
        lambda s: s["experimentId"] in experimentIDs if experimentIDs else True
    )

    # load sessions and return
    filepaths = [fp for fp in listdir(SESSION_DIR) if fp.endswith(".json")]
    sessions = [loadJSON(path.join(SESSION_DIR, fp)) for fp in filepaths]
    return [s for s in sessions if experimentFilter(s)]


def computeSimilarityData(sessions, simType="cont"):
    """
    creates a DataFrame of similarity data from list of session objects
    """
    levels = list(range(7))
    simFunc = simCont if simType == "cont" else simBin
    other = lambda g: 2 if g == 1 else 1

    # initialise data dict
    cols = ["id", "group"]
    for l in levels:
        cols += [
            f"level_{l + 1}_agent_1",
            f"level_{l + 1}_agent_2",
            f"level_{l + 1}_aligned",
            f"level_{l + 1}_misaligned",
        ]
    dataDict = {col: [] for col in cols}

    # populate data dict
    for s in sessions:
        dataDict["id"].append(s["id"])

        group = int(s["utility"]["goals"][1] == 50) + 1
        dataDict["group"].append(group)

        for l in levels:
            for a in [0, 1]:
                dataDict[f"level_{l + 1}_agent_{a + 1}"].append(
                    simFunc(AGENT_TRAJECTORIES[a][l], s["trajectories"][str(l)])
                )
            dataDict[f"level_{l + 1}_aligned"].append(
                dataDict[f"level_{l + 1}_agent_{group}"][-1]
            )
            dataDict[f"level_{l + 1}_misaligned"].append(
                dataDict[f"level_{l + 1}_agent_{other(group)}"][-1]
            )

    # convert to dataframe and return
    return pd.DataFrame(data=dataDict)


def trainTestSplit(x, y):
    return {"xtrain": x, "ytrain": y, "xtest": x, "ytest": y}


def logisticRegression(data):
    model = LogisticRegression(random_state=0, solver="newton-cg").fit(
        data["xtrain"], data["ytrain"]
    )
    return model.score(data["xtest"], data["ytest"])


def linearRegression(data):
    model = LinearRegression().fit(data["xtrain"], data["ytrain"])
    return model.score(data["xtest"], data["ytest"])


# ------------------------------------------------------------
# VISUALISATION FUNCTIONS
# ------------------------------------------------------------
def plotSimilarityData(data, levels, interactive=False, outputDir=".", outFormat="pdf"):
    sns.set_context("paper")
    sns.set_theme()

    # first variant - split groups
    fig, axs = plt.subplots(ncols=len(levels), sharey=True, figsize=(20, 4))
    for i, level in enumerate(levels):
        melted = data.rename(
            columns={
                f"level_{level}_agent_1": "agent 1",
                f"level_{level}_agent_2": "agent 2",
            }
        ).melt(
            id_vars=["group"],
            value_vars=["agent 1", "agent 2"],
            var_name="",
            value_name="similarity",
        )
        g = sns.barplot(
            data=melted,
            x="group",
            y="similarity",
            hue="",
            errorbar="se",
            errcolor="grey",
            errwidth=1.4,
            capsize=0.04,
            palette=sns.color_palette("husl", 10),
            ax=axs[i],
        )
        g.set(
            xlabel="group",
            ylim=[0, 1],
            ylabel=("mean trajectory similarity" if i == 0 else ""),
            title=f"Level {level}",
        )
        if i < len(levels) - 1:
            g.legend_.remove()

    fig.tight_layout()
    if interactive:
        plt.show()
    else:
        plt.savefig(
            path.join(
                outputDir, f"barplot_split_levels_{levels[0]}-{levels[-1]}.{outFormat}"
            )
        )

    # second variant - combined groups
    fig, axs = plt.subplots(ncols=len(levels), sharey=True, figsize=(15, 4))
    for i, level in enumerate(levels):
        melted = data.rename(
            columns={
                f"level_{level}_aligned": "aligned",
                f"level_{level}_misaligned": "misaligned",
            }
        ).melt(
            value_vars=["aligned", "misaligned"],
            var_name="agent",
            value_name="similarity",
        )
        g = sns.barplot(
            data=melted,
            x="agent",
            y="similarity",
            errorbar="se",
            errcolor="grey",
            errwidth=1.4,
            capsize=0.04,
            palette=sns.color_palette("husl", 10),
            ax=axs[i],
        )
        g.set(
            xlabel="",
            ylim=[0, 1],
            ylabel=("mean trajectory similarity" if i == 0 else ""),
            title=f"Level {level}",
        )

    fig.tight_layout()
    if interactive:
        plt.show()
    else:
        plt.savefig(
            path.join(
                outputDir,
                f"barplot_combined_levels_{levels[0]}-{levels[-1]}.{outFormat}",
            )
        )


def plotTrajectories(trajectories, gridSize, startPos):
    nRows, nCols = gridSize
    grid = np.zeros((nRows, nCols, 3))

    for traj in trajectories:
        coords = convertPathToCoords(traj, startPos)
        grid[coords[0]] = np.array([0, 1, 0])
        for (r, c) in coords[1:]:
            if r < nRows and c < nCols:
                grid[r, c] += (1 / len(trajectories)) * np.ones((3))

    return grid


def visualiseTrajectories(
    levels, sessions, similarityData, interactive=False, outputDir=".", outFormat="pdf"
):
    fig, axs = plt.subplots(ncols=len(levels))

    for i, level in enumerate(levels):
        grids, gridSize, startPos = (
            [],
            GRID_SIZES[level - 1],
            START_POSITIONS[level - 1],
        )

        # visualise trajectory of demonstrator agents
        grids += [
            plotTrajectories([agent[level - 1]], gridSize, startPos)
            for agent in AGENT_TRAJECTORIES
        ]

        # visualise trajectory of participants
        group1Trajectories, group2Trajectories = [], []
        for j, s in enumerate(sessions):
            traj = s["trajectories"][str(level - 1)]
            if similarityData.loc[j]["group"] == 1:
                group1Trajectories.append(traj)
            else:
                group2Trajectories.append(traj)

        grids += [
            plotTrajectories(group1Trajectories, gridSize, startPos),
            plotTrajectories(group2Trajectories, gridSize, startPos),
        ]

        nRows, nCols = gridSize
        margin = 2
        combinedGrid = np.ones(((nRows * 2) + margin, (nCols * 2) + margin, 3))

        combinedGrid[0:nRows, 0:nCols] = grids[0]
        combinedGrid[0:nRows, nCols + margin :] = grids[1]
        combinedGrid[nRows + margin :, :nCols] = grids[2]
        combinedGrid[nRows + margin :, nCols + margin :] = grids[3]

        axs[i].imshow(combinedGrid, cmap="gray")
        axs[i].set_title(f"Level {level}")
        axs[i].set_axis_off()

    fig.set_tight_layout(True)
    if interactive:
        plt.show()
    else:
        plt.savefig(
            path.join(
                outputDir, f"trajectories_levels_{levels[0]}-{levels[-1]}.{outFormat}"
            )
        )


# ------------------------------------------------------------
# ANALYSIS FUNCTIONS
# ------------------------------------------------------------
def doRegressionAnalysis(data, levels):
    logisticScores, linearScores = [], []

    # define independent variable
    x = data.group.to_numpy().reshape(-1, 1)

    for lvl in levels:
        # define dependent variables for logistic and linear regression
        cols = [f"level_{lvl}_agent_{i}" for i in [1, 2]]
        raw = data[cols]
        yBin = (raw.idxmax(axis=1) == cols[1]).to_numpy().astype(int) + 1
        yCont = (raw[cols[1]] - raw[cols[0]]).to_numpy()

        # perform logistic regression
        logisticScores.append(logisticRegression(trainTestSplit(x, yBin)))

        # perform linear regression
        linearScores.append(linearRegression(trainTestSplit(x, yCont)))

    return logisticScores, linearScores


def doChiSquareAnalysis(data, levels):
    chisqVals, pVals = [], []

    for lvl in levels:
        expected, observed = np.zeros((2, 2)), np.zeros((2, 2))

        cols = [f"level_{lvl}_agent_{i}" for i in [1, 2]]
        x = data["group"].to_numpy().astype(int)
        y = (data[cols].idxmax(axis=1) == cols[1]).to_numpy().astype(int) + 1

        groupTotals = collections.Counter(x)
        expected[:, 0] = groupTotals[1] / 2
        expected[:, 1] = groupTotals[2] / 2

        for i in range(len(x)):
            r = (y[i] == 1) - 1
            c = (x[i] == 1) - 1
            observed[r, c] += 1

        chisq, _ = chisquare(observed, expected)
        chisq = np.sum(chisq)

        chisqVals.append(chisq)
        pVals.append(1 - chi2.cdf(chisq, 1))

    return chisqVals, pVals


def main():
    levels = list(range(1, 8))  # 1 to 7
    outputDir = "../../results"

    sessions = loadSessions()
    similarityData = computeSimilarityData(sessions)

    # visualisation
    plotSimilarityData(similarityData, levels, outputDir=outputDir)
    visualiseTrajectories(levels, sessions, similarityData, outputDir=outputDir)

    # analysis
    logisticScores, linearScores = doRegressionAnalysis(similarityData, levels)
    chiSqVals, pVals = doChiSquareAnalysis(similarityData, levels)

    with open(path.join(outputDir, "analysis.csv"), "w") as f:
        fields = [
            "level",
            "log_regression_score",
            "lin_regression_r_squared",
            "chi_squared_val",
            "p_val",
        ]
        data = [levels, logisticScores, linearScores, chiSqVals, pVals]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(
            [{fields[i]: data[i][l-1] for i in range(len(fields))} for l in levels]
        )


if __name__ == "__main__":
    main()
