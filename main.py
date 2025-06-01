from bs4 import BeautifulSoup
import requests

r = requests.get("https://biterbattles.org/index.php?r=captain%2Findex&page=1")
if not r.text:
    raise Exception('Failed to fetch page')

soup = BeautifulSoup(r.text, 'html.parser')
games_history = soup.find_all('table')[-1]
print(games_history)

