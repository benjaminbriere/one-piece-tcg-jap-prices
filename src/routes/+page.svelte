<script lang="ts">
    import Header from "../components/Header.svelte";
    import scrapeIt from "scrape-it";
    import type { MissingCard, Product, Products, TotatPrices } from "../types/product.type";
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Tabs, TabItem, Checkbox } from "flowbite-svelte";
    import { TAX_PRICE, YEN_PRICE } from "../utils/constants";
    import { extractImageInfo, extractRarity, extractCode, extractState, webURL, missingCardsList, totalPricesCalc } from "../utils/functions";
    import Loader from "../components/Loader.svelte";
    
    let activeExtensionProducts: Products = [];
    let missingProducts: MissingCard[] = [];
    let activeTab = "OP01";
    const onlyAGrade = true;
    let displayLoader = true;
    let totalPrices: TotatPrices = {
      euroTaxesTotal: 0,
      euroTotal: 0,
      yenTotal: 0
    }
  
    let showOnlyMissingCards = false
    let showSP = true
    let showManga = true
    let showPSA10 = true
  
    let activeList: Products = []
    let listOP01: Products = [];
    let listOP02: Products = [];
    let listOP03: Products = [];
    let listOP04: Products = [];
    let listOP05: Products = [];
    let listOP06: Products = [];
    let listOP07: Products = [];
    let listOP08: Products = [];
    let listPRB01: Products = [];
  
    const extensionsList = ["OP01", "OP02", "OP03", "OP04", "OP05", "OP06", "OP07", "OP08", "PRB01"];
  
    async function searchProducts() {
      displayLoader = true;
      const regex = new RegExp("\n", 'g');
      const yenRegex = new RegExp('円', 'g');
  
      for (const extension of extensionsList) {
        const webSiteUrl = webURL(extension);
        const missingCards = missingCardsList(extension);
  
        const { data } = await scrapeIt(webSiteUrl, {
          content: ".itemlist_box",
          products: {
            listItem: ".list_item_cell",
            data: {
              name: {
                selector: ".goods_name",
                convert: (x: string) => x.replace(regex, '')
              },
              yenPrice: ".selling_price > .figure",
              link: ".item_data > a",
              url: {
                selector: ".global_photo",
                how: "html"
              }
            }
          }
        });
  
        //@ts-ignore
        const res: Products = data.products;
  
        const formattedResults = res.map((product: Product) => {
          const yenPrice = Number(String(product.yenPrice).replace(yenRegex, '').replace(',', ''));
          const euroPrice = Math.floor(yenPrice * YEN_PRICE * 100) / 100;
          const euroTaxPrice = Math.floor((euroPrice + euroPrice * TAX_PRICE) * 100) / 100;
  
          return {
            name: product.name,
            yenPrice: yenPrice,
            euroPrice: euroPrice,
            euroTaxPrice: euroTaxPrice,
            link: product.link,
            url: extractImageInfo(product.url),
            rarity: extractRarity(product.name),
            code: extractCode(product.name),
            state: extractState(product.name),
          };
        });
  
        const arrayResults = formattedResults
          .filter(p => onlyAGrade ? p.state === "A" || p.state === "PSA10" : p.state !== undefined)
          .filter(p => p.name.includes('パラレル'))
          .sort((a, b) => a.code.localeCompare(b.code));
  
        switch (extension) {
          case "OP01":
            listOP01 = arrayResults;
            break;
          case "OP02":
            listOP02 = arrayResults;
            break;
          case "OP03":
            listOP03 = arrayResults;
            break;
          case "OP04":
            listOP04 = arrayResults;
            break;
          case "OP05":
            listOP05 = arrayResults;
            break;
          case "OP06":
            listOP06 = arrayResults;
            break;
          case "OP07":
            listOP07 = arrayResults;
            break;
          case "OP08":
            listOP08 = arrayResults;
            break;
          case "PRB01":
            listPRB01 = arrayResults;
            break;
          default:
            break;
        }
      }
  
      displayLoader = false;
      activeExtensionProducts = listOP01;
      missingProducts = missingCardsList("OP01")
      activeList = listOP01;
      calculateTotalPrices()
    }
  
    function filterResult(list: Products){
      let filteredList: Products = list
      if(!showPSA10){
        filteredList = filteredList.filter(p => p.state === "A")
      }
      if(!showManga){
        filteredList = filteredList.filter(p => !p.name.includes("漫画背景"))
      }
      if(!showSP){
        filteredList = filteredList.filter(p => p.rarity !== "SP")
      }
      if(showOnlyMissingCards){
        console.log(filteredList)
        console.log(missingProducts)
        filteredList = filteredList.filter(p => missingProducts.find(m => m.name === p.code))
        console.log(filteredList)
      }
      return filteredList
    }
  
    function setActiveTab(newTab: string) {
      activeTab = newTab;
      switch (newTab) {
        case "OP01":
          activeList = listOP01
          missingProducts = missingCardsList("OP01")
          activeExtensionProducts = filterResult(listOP01);
          break;
        case "OP02":
          activeList = listOP02
          missingProducts = missingCardsList("OP02")
          activeExtensionProducts = filterResult(listOP02);
          break;
        case "OP03":
          activeList = listOP03
          missingProducts = missingCardsList("OP03")
          activeExtensionProducts = filterResult(listOP03);
          break;
        case "OP04":
          activeList = listOP04
          missingProducts = missingCardsList("OP04")
          activeExtensionProducts = filterResult(listOP04);
          break;
        case "OP05":
          activeList = listOP05
          missingProducts = missingCardsList("OP05")
          activeExtensionProducts = filterResult(listOP05);
          break;
        case "OP06":
          activeList = listOP06
          missingProducts = missingCardsList("OP06")
          activeExtensionProducts = filterResult(listOP06);
          break;
        case "OP07":
          activeList = listOP07
          missingProducts = missingCardsList("OP07")
          activeExtensionProducts = filterResult(listOP07);
          break;
        case "OP08":
          activeList = listOP08
          missingProducts = missingCardsList("OP08")
          activeExtensionProducts = filterResult(listOP08);
          break;
        case "PRB01":
          activeList = listPRB01
          missingProducts = missingCardsList("PRB01")
          activeExtensionProducts = filterResult(listPRB01);
          break;
        default:
          break;
      }
      calculateTotalPrices();
    }
  
    function calculateTotalPrices() {
      totalPrices.yenTotal = Math.floor(activeExtensionProducts.reduce((sum, product) => sum + product.yenPrice, 0));
      totalPrices.euroTotal = Math.floor(activeExtensionProducts.reduce((sum, product) => sum + product.euroPrice, 0));
      totalPrices.euroTaxesTotal = Math.floor(activeExtensionProducts.reduce((sum, product) => sum + product.euroTaxPrice, 0));
    }
  
    $: calculateTotalPrices();
  
    function setMissingCards(value: boolean){
      showOnlyMissingCards = value
      activeExtensionProducts = filterResult(activeList)
      calculateTotalPrices();
    }
  
    function setShowSp(value: boolean){
      showSP = value
      activeExtensionProducts = filterResult(activeList)
      calculateTotalPrices();
    }
  
    function setShowManga(value: boolean){
      showManga = value
      activeExtensionProducts = filterResult(activeList)
      calculateTotalPrices();
    }
  
    function setShowPSA10(value: boolean){
      showPSA10 = value
      activeExtensionProducts = filterResult(activeList)
      calculateTotalPrices();
    }
  
  
    searchProducts();
  </script>
  
  <main id="app">
    <Header />
  
    <Tabs class="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700" tabStyle="underline" contentClass="p-0">
      <TabItem open title="OP01" on:click={() => setActiveTab("OP01")} />
      <TabItem title="OP02" on:click={() => setActiveTab("OP02")} />
      <TabItem title="OP03" on:click={() => setActiveTab("OP03")} />
      <TabItem title="OP04" on:click={() => setActiveTab("OP04")} />
      <TabItem title="OP05" on:click={() => setActiveTab("OP05")} />
      <TabItem title="OP06" on:click={() => setActiveTab("OP06")} />
      <TabItem title="OP07" on:click={() => setActiveTab("OP07")} />
      <TabItem title="OP08" on:click={() => setActiveTab("OP08")} />
      <TabItem title="PRB01" on:click={() => setActiveTab("PRB01")} />
    </Tabs>
  
    {#if displayLoader}
      <Loader />
    {/if}
  
    <div class="flex gap-4 p-4 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
      <Checkbox checked={showOnlyMissingCards} on:click={() => setMissingCards(!showOnlyMissingCards)} class="text-color-100">Cartes manquantes</Checkbox>
      <Checkbox checked={showSP} on:click={() => setShowSp(!showSP)} class="text-color-100">SP</Checkbox>
      <Checkbox checked={showManga} on:click={() => setShowManga(!showManga)} class="text-color-100">Manga</Checkbox>
      <Checkbox checked={showPSA10} on:click={() => setShowPSA10(!showPSA10)} class="text-color-100">PSA 10</Checkbox>
    </div>
  
    <Table>
      <TableHead>
        <TableHeadCell>Code</TableHeadCell>
        <TableHeadCell>Rareté</TableHeadCell>
        <TableHeadCell>Etat</TableHeadCell>
        <TableHeadCell>Prix Yen</TableHeadCell>
        <TableHeadCell>Prix EURO (HT)</TableHeadCell>
        <TableHeadCell>Prix EURO (TTC)</TableHeadCell>
        <TableHeadCell>Photo</TableHeadCell>
      </TableHead>
      <TableBody tableBodyClass="divide-y">
        {#if activeExtensionProducts}
          {#if totalPrices}
          <TableBodyRow>
            <TableBodyCell>TOTAL</TableBodyCell>
            <TableBodyCell></TableBodyCell>
            <TableBodyCell></TableBodyCell>
            <TableBodyCell>{totalPrices.yenTotal ?? 0} ¥</TableBodyCell>
            <TableBodyCell>{totalPrices.euroTotal ?? 0} €</TableBodyCell>
            <TableBodyCell>{totalPrices.euroTaxesTotal ?? 0} €</TableBodyCell>
            <TableBodyCell></TableBodyCell>
          </TableBodyRow>
          {/if}
          {#each activeExtensionProducts as item}
            <TableBodyRow>
              <TableBodyCell>{item.code}</TableBodyCell>
              <TableBodyCell>{item.rarity}</TableBodyCell>
              <TableBodyCell>{item.state}</TableBodyCell>
              <TableBodyCell>{item.yenPrice}</TableBodyCell>
              <TableBodyCell>{item.euroPrice} €</TableBodyCell>
              <TableBodyCell>{item.euroTaxPrice} €</TableBodyCell>
              <TableBodyCell><img src={item.url} alt={item.name}/></TableBodyCell>
            </TableBodyRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </main>
  
  <style>
    main {
      width: 100%;
    }
  </style>