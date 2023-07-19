import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/petrol", async (req, res) => {
  // allow access from other domains
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: 0,
    });
    const page = await browser.newPage();

    await page.goto("https://hargapetrol.my/malaysia-petrol-prices-list.html");
    await page.waitForSelector(".pricetable > span");

    const data = await page.evaluate(() => {
      const priceTable = document.querySelectorAll(".pricetable > span");

      const data = [];
      Array.from(priceTable).map((element) => {
        const cur = {
          from: element.querySelector('.daterange[itemprop="validFrom"]')
            .innerText,
          through: element.querySelector('.daterange[itemprop="validThrough"]')
            .innerText,
          ron95: element.querySelector(".ron95").innerText,
          ron97: element.querySelector(".ron97").innerText,
          diesel: element.querySelector(".diesel").innerText,
        };

        data.push(cur);
      });
      return Promise.resolve(data);
    });

    // return a JSON object as a response
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "internal server error" });
    console.log("error", e);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

// start app
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("listening on port: " + port);
});
