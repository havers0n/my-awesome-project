import json
import time
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from fake_useragent import UserAgent
from selenium.common.exceptions import NoSuchElementException
import uvicorn

app = FastAPI()

# Request model
class ParseRequest(BaseModel):
    url: str

# Function to set up browser
def setup_browser():
    ua = UserAgent()
    opt = Options()
    opt.add_argument(f'user-agent={ua.random}')
    browser = webdriver.Firefox(options=opt)
    browser.maximize_window()
    return browser

# Function to handle captcha (placeholder)
def solve_captcha():
    print("Please solve the captcha manually in the browser window.")
    time.sleep(20)

# Function to parse a single item
def page_parse(item):
    info = {}
    item_left = item.find_element(By.CLASS_NAME, 'item-left')
    item_right = item.find_element(By.CLASS_NAME, 'item-right')
    info['user_name'] = item_left.find_element(By.CLASS_NAME, 'login-line').text
    info['country'] = item_left.find_element(By.CSS_SELECTOR, 'div.item-left > div > div:nth-child(3)').text
    info['rating_score'] = item_right.find_element(By.CLASS_NAME, 'rating-score').find_element(By.TAG_NAME, 'span').text
    info['date'] = item_right.find_element(By.CLASS_NAME, 'review-postdate').text
    return info

# Function to collect all items
def get_items_info(browser):
    result = []
    while True:
        items_list = browser.find_element(By.XPATH, '//*[@id="content"]/div/div/div/div/div[4]/div[1]/div[1]')
        items = items_list.find_elements(By.CLASS_NAME, 'item')
        for item in items:
            info = page_parse(item)
            result.append(info)
        try:
            browser.find_element(By.CLASS_NAME, 'next').click()
            time.sleep(2)  # slight delay for next page to load
        except NoSuchElementException:
            print('Parsing completed.')
            return result

@app.post("/parse")
async def parse_reviews(request: ParseRequest):
    browser = setup_browser()
    try:
        browser.get(url=request.url)
        solve_captcha()
        time.sleep(5)  # give time after captcha solve
        result = get_items_info(browser)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        browser.quit()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5550)

