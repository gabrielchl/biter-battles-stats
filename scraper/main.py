from bs4 import BeautifulSoup
import requests
import json

games = []

next_page = '/index.php?r=captain%2Findex'
while True:
    r = requests.get('https://biterbattles.org{}'.format(next_page))
    print('https://biterbattles.org{}'.format(next_page))
    if not r.text:
        raise Exception('Failed to fetch page')

    soup = BeautifulSoup(r.text, 'html.parser')
    games_history = soup.find_all('table')[-1]

    cols = [col.string for col in games_history.find('tr').find_all('th')]

    for row in games_history.find_all('tr')[1:]:
        cells = row.find_all('td')
        if len(cells) != len(cols):
            raise Exception('Row column count does not match expected count')
        games.append({cols[i]: [j for j in cells[i].stripped_strings] if sum(1 for _ in cells[i].stripped_strings) > 1 else (cells[i].string.strip() if cells[i].string else None) for i in range(len(cols))})
    
    found_next_page = soup.find('li', class_='next').find('a')
    if not found_next_page:
        break
    found_next_page = found_next_page['href']
    if not found_next_page or found_next_page == next_page:
        break
    next_page = found_next_page

with open('data.json', 'w') as f:
    json.dump(games, f)