import collections
import csv
import json
from math import floor, ceil
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
        7: "4,4,4,4,4,4,4,4,4,4,4",
        8: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
        9: "",
        10: "",
    },
    {
        0: "2,2,2,2,2,2,2,2,2,2,2,2",
        1: "1,1,1,1,1,1,1,1,1,1,1,1",
        2: "3,3,3,3,3,3,3,3,3,3,3,3",
        3: "4,4,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2",
        4: "4,4,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2",
        5: "3,3,3,3,3,3,3,3,3,3,3,3",
        6: "1,1,1,1,1,1,1,1,1,1,1,1",
        7: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
        8: "4,4,4,4,4,4,4,4,4,4,4",
        9: "",
        10: "",
    },
    {
        0: "",
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
        6: "",
        7: "4,4,4,4,4,4,4,4,4,4,4",
        8: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
        9: "1,1,1,1,1,1,1,1,1,1,1,1",
        10: "3,3,3,3,3,3,3,3,3,3,3,3",
    },
    {
        0: "",
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
        6: "",
        7: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
        8: "4,4,4,4,4,4,4,4,4,4,4",
        9: "3,3,3,3,3,3,3,3,3,3,3,3",
        10: "1,1,1,1,1,1,1,1,1,1,1,1",
    },
]
LEVEL_AGENT_MAP = {
    l: [a for a in range(len(AGENT_TRAJECTORIES)) if AGENT_TRAJECTORIES[a][l] != ""]
    for l in AGENT_TRAJECTORIES[0].keys()
}
GRID_SIZES = [
    (14, 25),
    (14, 25),
    (14, 25),
    (15, 19),
    (15, 19),
    (14, 25),
    (14, 25),
    (17, 21),
    (17, 21),
    (14, 25),
    (14, 25),
]
START_POSITIONS = [
    (12, 12),
    (12, 12),
    (12, 12),
    (5, 9),
    (5, 9),
    (6, 12),
    (6, 12),
    (2, 2),
    (2, 2),
    (6, 12),
    (6, 12),
]
MOVE_MAP = {"1": [0, -1], "2": [-1, 0], "3": [0, 1], "4": [1, 0]}
DATA_DIR = "../../data"
SESSION_DIR = path.join(DATA_DIR, "sessions")
LEVELS = [1, 2, 3, 4, 5, 6, 9, 10]


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


def removeNaNs(df):
    keepIndices = df.notnull().any(axis=1).to_numpy().nonzero()[0]
    return df.loc[keepIndices], keepIndices


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
    if not path1 or not path2:
        return np.nan
    return np.exp(-distanceBetweenPaths(path1, path2))


def simBin(path1, path2):
    """
    returns 1 if path1 and path2 have the same dominant direction, otherwise 0
    """
    if not path1 or not path2:
        return np.nan
    return int(computeDominantDirection(path1) == computeDominantDirection(path2))


def loadSessions(experimentIDs=[], filterInvalid=True):
    def filterFunc(s):
        res = True
        if experimentIDs and s["experimentId"] not in experimentIDs:
            res = False
        if filterInvalid and (not s["trajectories"] or s["humanId"] == "h-max"):
            res = False
        return res

    # load sessions and return
    filepaths = [fp for fp in listdir(SESSION_DIR) if fp.endswith(".json")]
    sessions = [loadJSON(path.join(SESSION_DIR, fp)) for fp in filepaths]
    return [s for s in sessions if filterFunc(s)]


def computeSimilarityData(sessions, levels=LEVELS, simType="cont"):
    """
    creates a DataFrame of similarity data from list of session objects
    """
    simFunc = simCont if simType == "cont" else simBin

    # initialise data dict
    cols = ["id", "utility_group", "experiment_group"]
    for l in levels:
        cols += [f"level_{l}_agent_{a + 1}" for a in LEVEL_AGENT_MAP[l]] + [
            f"level_{l}_aligned",
            f"level_{l}_misaligned",
        ]
    dataDict = {col: [] for col in cols}

    # populate data dict
    for s in sessions:
        # record id
        dataDict["id"].append(s["id"])

        # record utility group and experiment group
        utilityGroup = int(s["utility"]["goals"][1] == max(s["utility"]["goals"])) + 1
        experimentGroup = 1 if len(s["agentIds"]) == 2 else 2
        dataDict["utility_group"].append(utilityGroup)
        dataDict["experiment_group"].append(experimentGroup)

        for l in levels:
            # for each level, for each agent, record the similarity between their trajectory and
            # the participant's trajectory. if participant did not play this level, the similarity
            # function will return NaN.
            #
            # to make the data easier to work with, we also record the similarity between the
            # participant's trajectory and the aligned agent's trajectory, and the similarity
            # between the participant's trajectory and the misaligned agent's trajectory
            if str(l) not in s["trajectories"]:
                s["trajectories"][str(l)] = ""

            agents = LEVEL_AGENT_MAP[l]
            for a in agents:
                dataDict[f"level_{l}_agent_{a + 1}"].append(
                    simFunc(AGENT_TRAJECTORIES[a][l], s["trajectories"][str(l)])
                )

            alignedIdx = utilityGroup - 1  # 0 or 1
            aligned, misaligned = agents[alignedIdx], agents[1 - alignedIdx]

            dataDict[f"level_{l}_aligned"].append(
                dataDict[f"level_{l}_agent_{aligned + 1}"][-1]
            )
            dataDict[f"level_{l}_misaligned"].append(
                dataDict[f"level_{l}_agent_{misaligned + 1}"][-1]
            )

    # convert to dataframe and return
    return pd.DataFrame(data=dataDict)


def trainTestSplit(x, y):
    return {"xtrain": x, "ytrain": y, "xtest": x, "ytest": y}


def logisticRegression(data):
    model = LogisticRegression(random_state=0, solver="newton-cg").fit(
        data["xtrain"], data["ytrain"]
    )
    return model.coef_, model.score(data["xtest"], data["ytest"])


def linearRegression(data):
    model = LinearRegression().fit(data["xtrain"], data["ytrain"])
    return model.coef_, model.score(data["xtest"], data["ytest"])


# ------------------------------------------------------------
# VISUALISATION FUNCTIONS
# ------------------------------------------------------------
def plotSimilarityData(
    data, levels=LEVELS, interactive=False, outputDir=".", outFormat="pdf"
):
    sns.set_context("paper")
    sns.set_theme()

    fig, axs = plt.subplots(ncols=len(levels) - 1, sharey=True, figsize=(15, 4))

    # split similarity data by level
    levelData = []
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

        # remove NaN rows (i.e. sessions where participant did not play this level)
        levelData.append(melted[melted["similarity"].isna() == False])

    # helper func to plot a level
    def plotLevel(data, axsIdx, label):
        g = sns.barplot(
            data=data,
            x="agent",
            y="similarity",
            errorbar="se",
            errcolor="grey",
            errwidth=1.4,
            capsize=0.04,
            palette=sns.color_palette("husl", 10),
            ax=axs[axsIdx],
        )
        g.set(
            xlabel="",
            ylim=[0, 1],
            ylabel=("mean trajectory similarity" if i == 0 else ""),
            title=label,
        )

    # first plot levels 1-2 averaged together
    plotLevel(pd.concat(levelData[:2]), 0, "Levels 1-2")

    # then plot remaining levels individually
    for i in range(2, len(levels)):
        plotLevel(levelData[i], i - 1, f"Level {levels[i]}")

    fig.tight_layout()
    if interactive:
        plt.show()
    else:
        plt.savefig(
            path.join(
                outputDir,
                f"barplot_combined.{outFormat}",
            )
        )


def plotTrajectories(trajectories, gridSize, paddedSize, startPos):
    nRows, nCols = gridSize
    grid = np.zeros((nRows, nCols, 3))

    trajectories = [t for t in trajectories if t]

    for traj in trajectories:
        coords = convertPathToCoords(traj, startPos)
        grid[coords[0]] = np.array([0, 1, 0])
        for (r, c) in coords[1:]:
            if r < nRows and c < nCols:
                grid[r, c] += (1 / len(trajectories)) * np.ones((3))

    paddedRows, paddedCols = paddedSize
    diffR, diffC = max((paddedRows - nRows), 0), max((paddedCols - nCols), 0)
    rowsToAdd = (floor(diffR / 2), ceil(diffR / 2))
    colsToAdd = (floor(diffC / 2), ceil(diffC / 2))

    return np.pad(grid, (rowsToAdd, colsToAdd, (0, 0)))


def visualiseTrajectories(
    sessions,
    similarityData,
    levels=LEVELS,
    interactive=False,
    outputDir=".",
    outFormat="pdf",
):
    fig, axs = plt.subplots(ncols=len(levels), figsize=(20, 3))
    paddedSize = [max([gs[i] for gs in GRID_SIZES]) for i in [0, 1]]

    for i, level in enumerate(levels):
        grids, gridSize, startPos = (
            [],
            GRID_SIZES[level],
            START_POSITIONS[level],
        )

        # visualise trajectory of demonstrator agents
        agents = LEVEL_AGENT_MAP[level]
        grids += [
            plotTrajectories(
                [AGENT_TRAJECTORIES[a][level]], gridSize, paddedSize, startPos
            )
            for a in agents
        ]

        # visualise trajectory of participants
        group1Trajectories, group2Trajectories = [], []
        for j, s in enumerate(sessions):
            traj = s["trajectories"][str(level)]
            if similarityData.loc[j]["utility_group"] == 1:
                group1Trajectories.append(traj)
            else:
                group2Trajectories.append(traj)

        grids += [
            plotTrajectories(group1Trajectories, gridSize, paddedSize, startPos),
            plotTrajectories(group2Trajectories, gridSize, paddedSize, startPos),
        ]

        nRows, nCols = paddedSize
        margin = 2
        combinedGrid = np.ones(((nRows * 2) + margin, (nCols * 2) + margin, 3))

        combinedGrid[0:nRows, 0:nCols] = grids[0]
        combinedGrid[0:nRows, nCols + margin :] = grids[1]
        combinedGrid[nRows + margin :, :nCols] = grids[2]
        combinedGrid[nRows + margin :, nCols + margin :] = grids[3]

        axs[i].imshow(combinedGrid)
        axs[i].set_title(f"Level {level}", fontdict={"fontsize": 16})
        axs[i].set_axis_off()

    fig.set_tight_layout(True)
    if interactive:
        plt.show()
    else:
        plt.savefig(
            path.join(
                outputDir, f"trajectories_combined.{outFormat}"
            )
        )


# ------------------------------------------------------------
# ANALYSIS FUNCTIONS
# ------------------------------------------------------------
def doRegressionAnalysis(data, levels=LEVELS):
    logCoeffs, logScores, linCoeffs, linScores = [], [], [], []

    # define independent variable
    x = data["utility_group"].to_numpy().reshape(-1, 1)

    for lvl in levels:
        # define dependent variables for logistic and linear regression
        cols = [f"level_{lvl}_agent_{a + 1}" for a in LEVEL_AGENT_MAP[lvl]]
        raw = data[cols]

        # find indices of rows with NaN values and filter out
        raw, keepIndices = removeNaNs(raw)
        xTmp = x[keepIndices]

        yBin = (raw.idxmax(axis=1) == cols[1]).to_numpy().astype(int) + 1
        yCont = (raw[cols[1]] - raw[cols[0]]).to_numpy()

        # perform logistic regression
        coeffs, score = logisticRegression(trainTestSplit(xTmp, yBin))
        logCoeffs.append(coeffs[0][0])
        logScores.append(score)

        # perform linear regression
        coeffs, score = linearRegression(trainTestSplit(xTmp, yCont))
        linCoeffs.append(coeffs[0])
        linScores.append(score)

    return logCoeffs, logScores, linCoeffs, linScores


def doChiSquareAnalysis(data, levels=LEVELS):
    chisqVals, pVals = [], []

    for lvl in levels:
        expected, observed = np.zeros((2, 2)), np.zeros((2, 2))

        cols = [f"level_{lvl}_agent_{a + 1}" for a in LEVEL_AGENT_MAP[lvl]]
        raw, keepIndices = removeNaNs(data[cols])
        x = data["utility_group"].to_numpy().astype(int)[keepIndices]
        y = (raw.idxmax(axis=1) == cols[1]).to_numpy().astype(int) + 1

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
    outputDir = "../../results"

    sessions = loadSessions()
    similarityData = computeSimilarityData(sessions)

    # visualisation
    plotSimilarityData(similarityData, outputDir=outputDir)
    visualiseTrajectories(
        sessions, similarityData, outputDir=outputDir, outFormat="eps"
    )

    # analysis
    logCoeffs, logScores, linCoeffs, linScores = doRegressionAnalysis(similarityData)
    chiSqVals, pVals = doChiSquareAnalysis(similarityData)

    with open(path.join(outputDir, "analysis.csv"), "w") as f:
        fields = [
            "level",
            "log_regression_coeff",
            "log_regression_score",
            "lin_regression_coeff",
            "lin_regression_r_squared",
            "chi_squared_val",
            "p_val",
        ]
        data = [LEVELS, logCoeffs, logScores, linCoeffs, linScores, chiSqVals, pVals]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(
            [
                {fields[fIdx]: data[fIdx][lIdx - 1] for fIdx in range(len(fields))}
                for lIdx in range(len(LEVELS))
            ]
        )


if __name__ == "__main__":
    main()
