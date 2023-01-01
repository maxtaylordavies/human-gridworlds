import collections
import csv
import json
from os import path, listdir
import numpy as np
import matplotlib.pyplot as plt

MOVE_MAP = {"1": [-1, 0], "2": [0, 1], "3": [1, 0], "4": [0, -1]}
DATA_DIR = "data"
SESSION_DIR = path.join(DATA_DIR, "sessions")
TRAJECTORY_DIR = path.join(DATA_DIR, "trajectories")


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


def similarity1(path1, path2):
    """
    returns 1 / (d + 1), where d is the mean distance between the two paths
    """
    return 1 / (distanceBetweenPaths(path1, path2, norm=False) + 1)


def similarity2(path1, path2):
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


def analyseData(levels):
    results = []

    # load agent trajectories
    agentTrajectories = [
        loadJSON("data/trajectories/multijewel_a-0001.json")["paths"],
        loadJSON("data/trajectories/multijewel_a-0002.json")["paths"],
    ]

    # generate results
    filepaths = [fp for fp in listdir(SESSION_DIR) if fp.endswith(".json")]
    for fp in filepaths:
        # load session data and record ids
        sess, row = loadJSON(path.join(SESSION_DIR, fp)), {}
        row["session_id"], row["human_id"] = sess["id"], sess["humanId"]

        # try to load human trajectory. if it's not stored, skip to next session
        try:
            humanTrajectory = loadJSON(
                path.join(TRAJECTORY_DIR, f"multijewel_{sess['humanId']}.json")
            )["paths"]
        except:
            continue

        # record which agent the player shared their goal with
        row["correct_model"] = (
            sess["utility"]["goals"].index(max(sess["utility"]["goals"])) + 1
        )  # 1 if goal matches agent 1, 2 if it matches agent 2

        # record both continuous and binary similarity measures between the player's trajectory and both agents
        for l in levels:
            for i in [0, 1]:
                row[f"continuous_sim_level_{l}_agent_{i+1}"] = similarity1(
                    humanTrajectory[l], agentTrajectories[i][l]
                )
                row[f"binary_sim_level_{l}_agent_{i+1}"] = similarity2(
                    humanTrajectory[l], agentTrajectories[i][l]
                )

        results.append(row)

    return results


def saveResults(results):
    keys = results[0].keys()
    with open("tmp/results.csv", "w") as f:
        w = csv.DictWriter(f, keys)
        w.writeheader()
        w.writerows(results)


def averageVar(results, key):
    vals = [row[key] for row in results]
    return sum(vals) / len(vals)


def main():
    # levels = [str(i) for i in range(3, 7)]
    levels = ["3", "4"]
    results = analyseData(levels)

    saveResults(results)

    heatmap = np.zeros((2, 2 * len(levels)))
    for model in [1, 2]:
        rows = [r for r in results if r["correct_model"] == model]
        for i, l in enumerate(levels):
            heatmap[model - 1, (i * 2)] = averageVar(
                rows, f"continuous_sim_level_{l}_agent_1"
            )
            heatmap[model - 1, (i * 2) + 1] = averageVar(
                rows, f"continuous_sim_level_{l}_agent_2"
            )

    plt.imshow(heatmap)
    plt.colorbar()
    plt.show()


if __name__ == "__main__":
    main()
