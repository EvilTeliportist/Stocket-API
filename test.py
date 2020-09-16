import requests
from bs4 import BeautifulSoup as soup

response = requests.get('https://markets.businessinsider.com/stocks/aapl-stock', timeout=3)
parsed = soup(response.text, 'html.parser')


price = float(parsed.find_all('div', attrs={'class':'price-section__values'})[0].find('span').text.replace(",", ""))

print(price)