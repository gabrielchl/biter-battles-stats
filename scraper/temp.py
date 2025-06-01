import json
import itertools
import collections
import csv

stat_names = ['single', 'double', 'triple', 'quadruple']

stats = [collections.defaultdict(lambda: [0, 0, 0]) for _ in stat_names]

with open('data.json', 'r') as f:
    data = json.load(f)
    print(len(data))
    for match in data:
        if match['Captain North'] and match['Captain North'] not in match['North picks']:
            match['North picks'].append(match['Captain North'])
        if match['Captain South'] and match['Captain South'] not in match['South picks']:
            match['South picks'].append(match['Captain South'])

        winners = match['North picks' if match['Winner team'] == 'North' else 'South picks']
        losers = match['South picks' if match['Winner team'] == 'North' else 'North picks']

        for i in range(len(stat_names)):
            player_list = itertools.combinations(sorted(winners), i + 1)
            for player in player_list:
                stats[i][player][0] += 1
                stats[i][player][1] += 1
            player_list = itertools.combinations(sorted(losers), i + 1)
            for player in player_list:
                stats[i][player][0] += 1
                stats[i][player][2] += 1

for i, stat_name in enumerate(stat_names):
    stats_with_winrate = []

    for player, player_stats in stats[i].items():
        if player_stats[0] < 20:
            continue

        stats_with_winrate.append([*player, player_stats[0], player_stats[1], player_stats[2], player_stats[1] / player_stats[0]])
    stats_with_winrate.sort(reverse=True, key=lambda a: a[-1])

    with open('{}-stats.csv'.format(stat_name), 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([*['player {}'.format(j + 1) for j in range(0, i + 1)], 'games played', 'win count', 'lose count', 'winrate'])
        writer.writerows(stats_with_winrate)
