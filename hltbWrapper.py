from fastapi import FastAPI
from pprint import pprint
from howlongtobeatpy import HowLongToBeat
import asyncio

app = FastAPI()

async def getGamePlaytime(gameName):
    results_list = await HowLongToBeat().async_search(gameName)
    if results_list is not None and len(results_list) > 0:
        best_element = max(results_list, key=lambda element: element.similarity)
        return best_element
    else:
        return None
    
@app.get("/playtime/{gameName}")
async def read_playtime(gameName):
    result = await getGamePlaytime(gameName)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
