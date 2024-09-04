<script lang="ts">
	import Header from '../components/Header.svelte';
	import scrapeIt from 'scrape-it';
	import type { Product, Products, TotatPrices } from '$lib/types/product.type';
	import {
		Button,
		Card,
		Checkbox,
		Label, Popover,
		Select,
		TabItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tabs,
		Toast
	} from 'flowbite-svelte';
	import { TAX_PRICE } from '$lib/utils/constants';
	import {
		convertExtensionToConfigurationKey, convertToCSV,
		extractCode,
		extractImageInfo,
		extractRarity,
		extractState, generateKey,
		isCardMissing,
		webURL
	} from '$lib/utils/functions';
	import Loader from '../components/Loader.svelte';
	import { onMount } from 'svelte';
	import type { Configuration, ConfigurationExtension, Configurations } from '$lib/types/api.type';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import PriceIcon from '../components/PriceIcon.svelte';
	import HistoryPriceChart from '../components/HistoryPriceChart.svelte';

	let activeExtensionProducts: Products = [];
	let activeTab = 'OP01';
	let displayLoader = true;
	let totalPrices: TotatPrices = {
		euroTaxesTotal: 0,
		euroTotal: 0,
		yenTotal: 0
	};
	let yenPriceInEuro = 0;

	// Toaster
	let toasts: { message: string, type: string }[] = [];

	let showOnlyMissingCards = true;
	let showSP = true;
	let showManga = true;
	let showOnlyMint = true;
	let showOnlyParallel = true;
	let showPSA10 = false;

	let activeList: Products = [];
	let listOP01: Products = [];
	let listOP02: Products = [];
	let listOP03: Products = [];
	let listOP04: Products = [];
	let listOP05: Products = [];
	let listOP06: Products = [];
	let listOP07: Products = [];
	let listOP08: Products = [];
	let listOP09: Products = [];
	let listPRB01: Products = [];

	const extensionsList = ['OP01', 'OP02', 'OP03', 'OP04', 'OP05', 'OP06', 'OP07', 'OP08', 'OP09', 'PRB01'];

	let configurations: Configurations = [];
	let activeConfiguration: Configuration | undefined;
	let activeConfigurationId: string;

	$: activeConfiguration = configurations.find((config) => config.id === activeConfigurationId);

	let extensionsMap = new Map<string, Products>([
		['OP01', listOP01],
		['OP02', listOP02],
		['OP03', listOP03],
		['OP04', listOP04],
		['OP05', listOP05],
		['OP06', listOP06],
		['OP07', listOP07],
		['OP08', listOP08],
		['OP09', listOP09],
		['PRB01', listPRB01]
	]);

	async function loadData() {
		for (const extension of extensionsList) {
			try {
				const response = await fetch(`/api/card/getByExtension?extension=${extension}`);
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const result = await response.json();

				switch (extension) {
					case 'OP01':
						listOP01 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP01;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP02':
						listOP02 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP02;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP03':
						listOP03 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP03;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP04':
						listOP04 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP04;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP05':
						listOP05 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP05;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP06':
						listOP06 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP06;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP07':
						listOP07 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP07;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP08':
						listOP08 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP08;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'OP09':
						listOP09 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listOP09;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					case 'PRB01':
						listPRB01 = result;
						if (activeTab === extension) {
							activeExtensionProducts = listPRB01;
							activeList = result;
							calculateTotalPrices();
						}
						break;
					default:
						break;
				}
			} catch (err: any) {
				console.debug(err.message);
			}
		}
		displayLoader = false;
	}

	async function loadConfiguration() {
		try {
			const response = await fetch(`/api/configuration/getAll`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const result = await response.json();

			configurations = result;
			activeConfiguration = result[0] ?? undefined;
			activeConfigurationId = result[0].id ?? '';
		} catch (err: any) {
			console.debug(err.message);
		}
	}

	async function searchProducts() {
		displayLoader = true;
		// eslint-disable-next-line no-control-regex
		const regex = new RegExp('\n', 'g');
		const yenRegex = new RegExp('円', 'g');

		listOP01 = [];
		listOP02 = [];
		listOP03 = [];
		listOP04 = [];
		listOP05 = [];
		listOP06 = [];
		listOP07 = [];
		listOP08 = [];
		listOP09 = [];
		listPRB01 = [];

		for (const extension of extensionsList) {
			const webSiteUrl = webURL(extension);
			const maxPages = 3;

			for (let i = 1; i <= maxPages; i++) {
				const { data } = await scrapeIt(`${webSiteUrl}&page=${i}`, {
					content: '.itemlist_box',
					products: {
						listItem: '.list_item_cell',
						data: {
							name: {
								selector: '.goods_name',
								convert: (x: string) => x.replace(regex, '')
							},
							yenPrice: '.selling_price > .figure',
							link:
								{
									selector: '.item_data_link',
									attr: 'href'
								},
							url: {
								selector: '.global_photo',
								how: 'html'
							}
						}
					}
				});

				//@ts-expect-error ignore type of scrape-it
				const res: Products = data.products;

				const formattedResults = res.map((product: Product) => {
					const yenPrice = Number(String(product.yenPrice).replace(yenRegex, '').replace(',', '')) * 1.05;
					const euroPrice = Math.floor(yenPrice * yenPriceInEuro * 100) / 100;
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
						parallel: product.name.includes('パラレル'),
						previousEuroTaxPrice: undefined,
						extension: extension
					};
				});

				const arrayResults: Product[] = formattedResults
					.sort((a, b) => a.code.localeCompare(b.code));

				switch (extension) {
					case 'OP01':
						listOP01 = [...listOP01, ...arrayResults];
						break;
					case 'OP02':
						listOP02 = [...listOP02, ...arrayResults];
						break;
					case 'OP03':
						listOP03 = [...listOP03, ...arrayResults];
						break;
					case 'OP04':
						listOP04 = [...listOP04, ...arrayResults];
						break;
					case 'OP05':
						listOP05 = [...listOP05, ...arrayResults];
						break;
					case 'OP06':
						listOP06 = [...listOP06, ...arrayResults];
						break;
					case 'OP07':
						listOP07 = [...listOP07, ...arrayResults];
						break;
					case 'OP08':
						listOP08 = [...listOP08, ...arrayResults];
						break;
					case 'OP09':
						listOP09 = [...listOP09, ...arrayResults];
						break;
					case 'PRB01':
						listPRB01 = [...listPRB01, ...arrayResults];
						break;
					default:
						break;
				}
			}
		}

		extensionsMap.set('OP01', listOP01);
		extensionsMap.set('OP02', listOP02);
		extensionsMap.set('OP03', listOP03);
		extensionsMap.set('OP04', listOP04);
		extensionsMap.set('OP05', listOP05);
		extensionsMap.set('OP06', listOP06);
		extensionsMap.set('OP07', listOP07);
		extensionsMap.set('OP08', listOP08);
		extensionsMap.set('OP09', listOP09);
		extensionsMap.set('PRB01', listPRB01);
	}

	function filterResult(list: Products, configuration?: string) {
		let filteredList: Products = list;
		if (!showPSA10) {
			filteredList = filteredList.filter((p) => p.state !== 'PSA10');
		}
		if (showPSA10) {
			filteredList = filteredList.filter((p) => p.state === 'PSA10');
		}
		if (!showManga) {
			filteredList = filteredList.filter((p) => !p.name.includes('漫画背景'));
		}
		if (!showSP) {
			filteredList = filteredList.filter((p) => p.rarity !== 'SP');
		}
		if (showOnlyMint) {
			filteredList = filteredList.filter((p) => p.state === 'A');
		}
		if (showOnlyParallel) {
			filteredList = filteredList.filter((p) => p.parallel === true);
		}
		if (showOnlyMissingCards) {
			if (activeConfiguration) {
				const key = convertExtensionToConfigurationKey(configuration ?? activeTab);
				if (Array.isArray(activeConfiguration[key])) {
					const missingCardsOfActiveExtension: ConfigurationExtension[] = activeConfiguration[key] as ConfigurationExtension[];

					filteredList = filteredList.filter((p) =>
						missingCardsOfActiveExtension.some(m => m.name === p.code && m.parallel === p.parallel && m.rarity === p.rarity)
					);
				}
			}
		}
		return filteredList;
	}

	function setActiveTab(newTab: string) {
		activeTab = newTab;
		switch (newTab) {
			case 'OP01':
				activeList = listOP01;
				activeExtensionProducts = filterResult(listOP01);
				break;
			case 'OP02':
				activeList = listOP02;
				activeExtensionProducts = filterResult(listOP02);
				break;
			case 'OP03':
				activeList = listOP03;
				activeExtensionProducts = filterResult(listOP03);
				break;
			case 'OP04':
				activeList = listOP04;
				activeExtensionProducts = filterResult(listOP04);
				break;
			case 'OP05':
				activeList = listOP05;
				activeExtensionProducts = filterResult(listOP05);
				break;
			case 'OP06':
				activeList = listOP06;
				activeExtensionProducts = filterResult(listOP06);
				break;
			case 'OP07':
				activeList = listOP07;
				activeExtensionProducts = filterResult(listOP07);
				break;
			case 'OP08':
				activeList = listOP08;
				activeExtensionProducts = filterResult(listOP08);
				break;
			case 'OP09':
				activeList = listOP09;
				activeExtensionProducts = filterResult(listOP09);
				break;
			case 'PRB01':
				activeList = listPRB01;
				activeExtensionProducts = filterResult(listPRB01);
				break;
			default:
				break;
		}
		calculateTotalPrices();
	}

	function calculateTotalPrices() {
		totalPrices.yenTotal = Math.floor(
			activeExtensionProducts.reduce((sum, product) => sum + product.yenPrice, 0)
		);
		totalPrices.euroTotal = Math.floor(
			activeExtensionProducts.reduce((sum, product) => sum + product.euroPrice, 0)
		);
		totalPrices.euroTaxesTotal = Math.floor(
			activeExtensionProducts.reduce((sum, product) => sum + product.euroTaxPrice, 0)
		);
	}

	$: calculateTotalPrices();

	function setMissingCards(value: boolean) {
		showOnlyMissingCards = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	function setShowSp(value: boolean) {
		showSP = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	function setShowManga(value: boolean) {
		showManga = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	function setShowPSA10(value: boolean) {
		showPSA10 = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	function setShowOnlyParallel(value: boolean) {
		showOnlyParallel = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	function setShowOnlyMint(value: boolean) {
		showOnlyMint = value;
		activeExtensionProducts = filterResult(activeList);
		calculateTotalPrices();
	}

	async function addCards() {

		yenPriceInEuro = await (await fetch('api/utils/yenRate')).json();

		await searchProducts();

		for (const [key, extension] of extensionsMap) {
			try {
				const response = await fetch('/api/card/add', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(extension)
				});

				if (response.ok) {
					const data = await response.json();
					console.debug('Data added:', data);
					toasts = [...toasts, { message: `Prix de ${key} mis à jour`, type: 'success' }];
				} else {
					const error = await response.json();
					console.error('Error adding data:', error.message);
					toasts = [...toasts, { message: `Erreur dans l'import des prix de ${key}`, type: 'error' }];
				}
			} catch (err) {
				console.error('Fetch error:', err);
				toasts = [...toasts, { message: `Erreur API pour ${key}`, type: 'error' }];
			}
		}
		loadData();
	}

	function handleMissingCardCheckboxChange(event: Event, code: string, parallel: boolean, rarity: string) {
		const target = event.target as HTMLInputElement;
		const value = target.checked;

		if (activeConfiguration) {
			const extensionKey = convertExtensionToConfigurationKey(activeTab);
			const currentExtensionData = activeConfiguration[extensionKey];

			if (Array.isArray(currentExtensionData)) {
				const index = currentExtensionData.findIndex(
					(item) => item.name === code && item.parallel === parallel && item.rarity === rarity
				);

				if (value) {
					if (index === -1) {
						currentExtensionData.push({ name: code, parallel, rarity });
					}
				} else {
					if (index !== -1) {
						currentExtensionData.splice(index, 1);
					}
				}

				activeConfiguration = {
					...activeConfiguration,
					[extensionKey]: [...currentExtensionData]
				};
			}
		}
	}

	async function saveConfiguration() {
		try {
			const response = await fetch('/api/configuration/updateOne', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(activeConfiguration)
			});

			if (response.ok) {
				const data = await response.json();
				toasts = [...toasts, { message: `Sélection de ${activeConfiguration?.name} mise à jour`, type: 'success' }];
				console.debug('Data added:', data);
			} else {
				const error = await response.json();
				toasts = [...toasts, {
					message: `Erreur dans mise à jour de la sélection de ${activeConfiguration?.name}`,
					type: 'success'
				}];
				console.error('Error adding data:', error.message);
			}
		} catch (err) {
			console.error('Fetch error:', err);
		}
	}

	function exportConfiguration() {
		const allCards = [
			...filterResult(listOP01, 'OP01'),
			...filterResult(listOP02, 'OP02'),
			...filterResult(listOP03, 'OP03'),
			...filterResult(listOP04, 'OP04'),
			...filterResult(listOP05, 'OP05'),
			...filterResult(listOP06, 'OP06'),
			...filterResult(listOP07, 'OP07'),
			...filterResult(listOP08, 'OP08'),
			...filterResult(listOP08, 'OP09'),
			...filterResult(listPRB01, 'PRB01')
		];
		const csv = convertToCSV(allCards);
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'data.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

	}

	function removeToast(index: number) {
		toasts = toasts.filter((_, i) => i !== index);
	}

	onMount(async () => {
		await loadConfiguration();
		await loadData();
		activeExtensionProducts = filterResult(activeExtensionProducts);
	});
</script>

<main id="app" class="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
	<Header />

	<Tabs
		class="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
		tabStyle="underline"
		contentClass="p-0"
	>
		<TabItem open title="OP01" on:click={() => setActiveTab('OP01')} />
		<TabItem title="OP02" on:click={() => setActiveTab('OP02')} />
		<TabItem title="OP03" on:click={() => setActiveTab('OP03')} />
		<TabItem title="OP04" on:click={() => setActiveTab('OP04')} />
		<TabItem title="OP05" on:click={() => setActiveTab('OP05')} />
		<TabItem title="OP06" on:click={() => setActiveTab('OP06')} />
		<TabItem title="OP07" on:click={() => setActiveTab('OP07')} />
		<TabItem title="OP08" on:click={() => setActiveTab('OP08')} />
		<TabItem title="OP09" on:click={() => setActiveTab('OP09')} />
		<TabItem title="PRB01" on:click={() => setActiveTab('PRB01')} />
	</Tabs>

	{#if displayLoader}
		<Loader />
	{/if}

	<div
		class="flex flex-wrap gap-4 bg-gray-100 p-4 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
	>
		<Checkbox
			checked={showOnlyMissingCards}
			on:click={() => setMissingCards(!showOnlyMissingCards)}
			class="text-color-100"
		>
			Cartes manquantes
		</Checkbox>
		<Checkbox checked={showOnlyParallel} on:click={() => setShowOnlyParallel(!showOnlyParallel)} class="text-color-100">
			AA uniquement
		</Checkbox>
		<Checkbox checked={showSP} on:click={() => setShowSp(!showSP)} class="text-color-100">
			SP
		</Checkbox>
		<Checkbox checked={showManga} on:click={() => setShowManga(!showManga)} class="text-color-100">
			Manga
		</Checkbox>
		<Checkbox checked={showPSA10} on:click={() => setShowPSA10(!showPSA10)} class="text-color-100">
			PSA 10
		</Checkbox>
		<Checkbox checked={showOnlyMint} on:click={() => setShowOnlyMint(!showOnlyMint)} class="text-color-100">
			Mint uniquement
		</Checkbox>
		<Button on:click={() => addCards()}>Mettre à jour les prix</Button>
		<Button on:click={() => saveConfiguration()}>Enregistrer liste cartes manquantes</Button>
		<Button on:click={() => exportConfiguration()}>Exporter les cartes manquantes</Button>
	</div>

	{#if configurations.length > 0 && activeConfigurationId}
		<div class="p-4">
			<Label>
				Choisir une configuration
				<Select class="mt-2" bind:value={activeConfigurationId} placeholder="Configuration">
					{#each configurations as { id, name }}
						<option value={id}>{name}</option>
					{/each}
				</Select>
			</Label>
		</div>
	{/if}

	<Table>
		<TableHead>
			<TableHeadCell>TOTAL</TableHeadCell>
			<TableHeadCell>Prix Yen</TableHeadCell>
			<TableHeadCell>Prix EURO (HT)</TableHeadCell>
			<TableHeadCell>Prix EURO (TTC)</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#if activeExtensionProducts}
				{#if totalPrices}
					<TableBodyRow>
						<TableBodyCell>TOTAL</TableBodyCell>
						<TableBodyCell>{totalPrices.yenTotal ?? 0} ¥</TableBodyCell>
						<TableBodyCell>{totalPrices.euroTotal ?? 0} €</TableBodyCell>
						<TableBodyCell>{totalPrices.euroTaxesTotal ?? 0} €</TableBodyCell>
					</TableBodyRow>
				{/if}
			{/if}
		</TableBody>
	</Table>
	<Table class="hidden xl:table">
		<TableHead>
			<TableHeadCell>Manquante</TableHeadCell>
			<TableHeadCell></TableHeadCell>
			<TableHeadCell>Code</TableHeadCell>
			<TableHeadCell>Rareté</TableHeadCell>
			<TableHeadCell>Etat</TableHeadCell>
			<TableHeadCell>Prix Yen</TableHeadCell>
			<TableHeadCell>Prix EURO (HT)</TableHeadCell>
			<TableHeadCell>Précédent prix (TTC)</TableHeadCell>
			<TableHeadCell>Prix EURO (TTC)</TableHeadCell>
			<TableHeadCell>Cardmarket (TTC)</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#if activeExtensionProducts}
				{#each activeExtensionProducts as item (generateKey(item))}
					<TableBodyRow>
						<TableBodyCell>
							<Checkbox
								checked={isCardMissing(
                convertExtensionToConfigurationKey(activeTab),
                item.code,
                item.parallel,
                item.rarity,
                activeConfiguration
              )}
								on:change={(event) =>
                handleMissingCardCheckboxChange(
                  event,
                  item.code,
                  item.parallel,
                  item.rarity,
                )}
							/>
						</TableBodyCell>
						<TableBodyCell><img src={`images/${item.local_url}`} alt={item.name} /></TableBodyCell>
						<TableBodyCell>
							<a href="{item.link}" target="_blank" class="text-primary-600 underline">{item.code}</a>
						</TableBodyCell>
						<TableBodyCell>{item.rarity}</TableBodyCell>
						<TableBodyCell>{item.state}</TableBodyCell>
						<TableBodyCell>{item.yenPrice}</TableBodyCell>
						<TableBodyCell>{item.euroPrice}€</TableBodyCell>
						<TableBodyCell>
							{item?.previousEuroTaxPrice ? `${item?.previousEuroTaxPrice}€` : '-'}
						</TableBodyCell>
						<TableBodyCell>
							<div class="flex">
								<span id={`history_price_${item.code.replace('[', '_').replace(']','_')}_${item.rarity}_${item.state}`}>
									<PriceIcon
										euroTaxPrice={item.euroTaxPrice}
										previousTaxPrice={item?.previousEuroTaxPrice}
									/>
								</span>
								<span
									class={`pl-1 pt-1 ${item.cardmarketPrice && item.cardmarketPrice < item.euroTaxPrice ? "text-red-500" : "text-green-500"}`}>
                {item.euroTaxPrice} €
              </span>
								<Popover
									placement="left"
									trigger="click"
									triggeredBy={`#history_price_${item.code.replace('[', '_').replace(']','_')}_${item.rarity}_${item.state}`}>
									<div class="min-w-80">
										{#if item.historyPrice && item.historyPrice.length > 0}
											<HistoryPriceChart historyPrice={item.historyPrice} />
										{:else}
											<p>Aucune donnée historique disponible</p>
										{/if}
									</div>
								</Popover>
							</div>
						</TableBodyCell>
						<TableBodyCell>
							<p
								class={item.cardmarketPrice && item.cardmarketPrice < item.euroTaxPrice ? "text-green-500" : "text-red-500"}>
								{item.cardmarketPrice ? `${item.cardmarketPrice}€` : '-'}
							</p>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>

	<div class="flex flex-wrap xl:hidden">
		{#each activeExtensionProducts as item}
			<div class="m-auto w-1/2 sm:w-1/3 lg:w-1/4 p-2">
				<Card img={`images/${item.local_url}`}>
					<div class="flex justify-between">
						<h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white"><a href="{item.link}"
																																															 target="_blank"
																																															 class="text-primary-600 underline">{item.code}</a>

						</h5>
						<Checkbox
							checked={isCardMissing(
									convertExtensionToConfigurationKey(activeTab),
									item.code,
									item.parallel,
									item.rarity,
									activeConfiguration
								)}
							on:change={(event) =>
									handleMissingCardCheckboxChange(
										event,
										item.code,
										item.parallel,
										item.rarity,
									)}
						/>
					</div>
					<div class="flex justify-between">
						<div>
							<p class="text-sm text-gray-900 dark:text-white">Cardrush</p>
							<p
								class={`text-md font-bold ${item.cardmarketPrice && item.cardmarketPrice < item.euroTaxPrice ? "text-red-500" : "text-green-500"}`}>{item.euroTaxPrice}
								€</p>
						</div>
						<div>
							<p class="text-sm text-gray-900 dark:text-white">Cardmarket</p>
							<p
								class={`text-md font-bold ${item.cardmarketPrice && item.cardmarketPrice < item.euroTaxPrice ? "text-green-500" : "text-red-500"}`}>{item.cardmarketPrice ? `${item.cardmarketPrice} €` : '-'}</p>
						</div>
					</div>
				</Card>
			</div>
		{/each}
	</div>


	<div class="toast-container">
		{#each toasts as toast, index}
			<Toast on:hide={() => removeToast(index)} color={toast.type === "success" ? "green" : "red"}>
				<svelte:fragment slot="icon">
					{#if toast.type === "success" }
						<CheckCircleSolid class="w-5 h-5" />
						<span class="sr-only">Check icon</span>
					{/if}
					{#if toast.type === "error" }
						<CloseCircleSolid class="w-5 h-5" />
						<span class="sr-only">Error icon</span>
					{/if}
				</svelte:fragment>
				{toast.message}
			</Toast>
		{/each}
	</div>

</main>

<style>
    main {
        width: 100%;
        min-height: 100vh;
    }

    .toast-container {
        position: fixed;
        top: 20px; /* Position de départ */
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px; /* Espace entre les toasts */
    }

</style>
