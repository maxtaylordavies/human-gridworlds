import collections
import json
from os import path, listdir

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_context("paper")
sns.set_theme()

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
MOVE_MAP = {"1": [-1, 0], "2": [0, 1], "3": [1, 0], "4": [0, -1]}
DATA_DIR = "../../data"
SESSION_DIR = path.join(DATA_DIR, "sessions")
TRAJECTORY_DIR = path.join(DATA_DIR, "trajectories")


def logValue(msg, val):
    print(f"{msg}: {val}")


def loadJSON(fp):
    with open(fp) as f:
        data = json.load(f)
    return data


def convertPathToCoords(path):
    coords = [[0, 0]]
    for move in path.split(","):
        coords.append(
            [coords[-1][0] + MOVE_MAP[move][0], coords[-1][1] + MOVE_MAP[move][1]]
        )
    return coords


def distanceBetweenPaths(path1, path2, type="avg", norm=True):
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
    res = operator(distances)
    return res / len(distances) if norm else res


def computeDominantDirection(path):
    counts = collections.Counter(path.replace(",", ""))
    return max(counts, key=counts.get)


def simCont(path1, path2):
    """
    returns 1 / (d + 1), where d is the mean distance between the two paths
    """
    return 1 / (distanceBetweenPaths(path1, path2, norm=False) + 1)


def simBin(path1, path2):
    """
    returns 1 if path1 and path2 have the same dominant direction, otherwise 0
    """
    return int(computeDominantDirection(path1) == computeDominantDirection(path2))


# def similarity3(path1, path2):
#     """
#     returns 1 - (d / l), where d is the mean distance between the two paths and l is the (longer) path length
#     """
#     return 1 - distanceBetweenPaths(path1, path2)


# def similarity4(path1, path2):
#     """
#     returns 1 / (d + 1), where d is the maximum distance between the two paths
#     """
#     return 1 / (distanceBetweenPaths(path1, path2, type="max") + 1)


def loadData(experimentIDs=[], simType="cont"):
    """
    creates a DataFrame of similarity data from session json files
    """
    experimentFilter = (
        lambda s: s["experimentId"] in experimentIDs if experimentIDs else True
    )
    levels = list(range(7))
    simFunc = simCont if simType == "cont" else simBin

    # load sessions
    filepaths = [fp for fp in listdir(SESSION_DIR) if fp.endswith(".json")]
    sessions = [loadJSON(path.join(SESSION_DIR, fp)) for fp in filepaths]
    sessions = [s for s in sessions if experimentFilter(s)]

    # initialise data dict
    cols = ["id", "group"] + [
        f"level_{l + 1}_agent_{a + 1}" for l in levels for a in [0, 1]
    ]
    dataDict = {col: [] for col in cols}

    # populate data dict
    for s in sessions:
        dataDict["id"].append(s["id"])
        dataDict["group"].append(f"group {int(s['utility']['goals'][1] == 50) + 1}")
        for l in levels:
            for a in [0, 1]:
                dataDict[f"level_{l + 1}_agent_{a + 1}"].append(
                    simFunc(AGENT_TRAJECTORIES[a][l], s["trajectories"][str(l)])
                )

    # convert to dataframe and return
    return pd.DataFrame(data=dataDict)


def makePlotForLevels(data, levels, outFolder=".", outFormat="pdf"):
    fig, axs = plt.subplots(
        ncols=len(levels), sharey=True, figsize=(20, 4)
    )
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
            xlabel="",
            ylim=[0, 1],
            ylabel=("mean trajectory similarity" if i == 0 else ""),
            title=f"Level {level}",
        )
        if i < len(levels) - 1:
            g.legend_.remove()

    fig.tight_layout()
    plt.savefig(
        path.join(outFolder, f"barplot_levels_{levels[0]}-{levels[-1]}.{outFormat}")
    )


def main():
    data = loadData()
    makePlotForLevels(data, [1, 2, 3, 4, 5, 6, 7], outFormat="png")


if __name__ == "__main__":
    main()
