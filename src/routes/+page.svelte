<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    MATERIALS, 
    ROBOT_UPGRADES, 
    BASE_UPGRADES
  } from '$lib/data.js';
  import { ELECTRONICS } from '$lib/electronics.js';
  import { VEHICLES } from '$lib/vehicles.js';
  import { QUESTS } from '$lib/quests.js';
  import { createInventory, addToInventory } from '$lib/game/inventory.js';
  import { MATERIAL_SELL_VALUES, marketBuyPrice, normalizeMarketAmount } from '$lib/game/market.js';
  import {
    XP_REWARDS,
    experienceForFoundItem,
    getLevelForXp,
    requiredUpgradeLevel,
    xpForNextLevel,
    xpIntoCurrentLevel
  } from '$lib/game/progression.js';
  import GameHeader from '$lib/components/GameHeader.svelte';
  import RobotSidebar from '$lib/components/RobotSidebar.svelte';

  const SAVE_KEY = 'scrapbot-save-v1';

  // --- SPIEL-ZUSTAND ---
  let activeTab = $state('basis');
  let energy = $state(100);
  let maxEnergy = $state(100);

  // --- ADMIN / DEV-MODUS ZUSTAND ---
  let isAdmin = $state(false);
  let adminPasswordInput = $state('');
  let adminError = $state('');

  function loginAdmin() {
    if (adminPasswordInput.trim().toLowerCase() === 'admin' || adminPasswordInput.trim().toLowerCase() === 'cheat') {
      isAdmin = true;
      adminError = '';
      activeTab = 'dev';
    } else {
      adminError = 'Falsches Passwort! (Tipp: admin oder cheat)';
    }
  }

  function logoutAdmin() {
    isAdmin = false;
    if (activeTab === 'dev') activeTab = 'basis';
  }

  // Material-Inventar
  let materials = $state<Record<string, number>>({
    scrap: 0, copper: 0, aluminum: 0, transistors: 0,
    chips: 0, resistors: 0, diodes: 0, screws: 0,
    springs: 0, leather: 0, plastic: 0, glass: 0
  });

  let credits = $state(0);
  const BATTERY_PRICE = 50;
  const BATTERY_ENERGY = 50;
  let batteries = $state(0);
  let experiencePoints = $state(0);
  let playerLevel = $derived(getLevelForXp(experiencePoints));
  let currentLevelXp = $derived(xpIntoCurrentLevel(experiencePoints));
  let nextLevelXp = $derived(xpForNextLevel(playerLevel));

  function awardExperience(amount: number) {
    experiencePoints += Math.max(0, amount);
  }

  function buyBatteries(amount: number = 1) {
    const count = Math.max(1, Math.floor(amount));
    const cost = BATTERY_PRICE * count;
    if (credits < cost) return;

    credits -= cost;
    statistics.creditsSpent += cost;
    batteries += count;
  }

  function useBattery() {
    if (batteries <= 0 || energy >= maxEnergy) return;

    batteries -= 1;
    energy = Math.min(maxEnergy, energy + BATTERY_ENERGY);
  }

  let materialSellInputs = $state<Record<string, number>>({});
  let deviceMarketInputs = $state<Record<string, number>>({});
  let vehicleMarketInputs = $state<Record<string, number>>({});
  let batteryMarketInput = $state(1);

  function rarityClass(rarity: string) {
    return `rarity-${rarity}`;
  }

  // Inventare
  let deviceInventory = $state<Record<string, number>>(createInventory(ELECTRONICS, 'wecker'));

  let vehicleInventory = $state<Record<string, number>>(createInventory(VEHICLES, 'old_car'));

  // Upgrades
  let purchasedUpgrades = $state<string[]>([]);
  let purchasedBaseUpgrades = $state<string[]>([]);

  // QUEST-ZUSTAND
  let completedQuestIds = $state<string[]>([]);
  let questMessage = $state('');
  let saveReady = $state(false);
  let statistics = $state({
    resourcesCollected: 0,
    playerResourcesCollected: 0,
    droneResourcesCollected: 0,
    autoResourcesCollected: 0,
    electronicsFound: 0,
    playerElectronicsFound: 0,
    droneElectronicsFound: 0,
    vehiclesFound: 0,
    playerVehiclesFound: 0,
    electronicsDismantled: 0,
    playerElectronicsDismantled: 0,
    autoElectronicsDismantled: 0,
    vehiclesDismantled: 0,
    playerVehiclesDismantled: 0,
    autoVehiclesDismantled: 0,
    questsCompleted: 0,
    creditsEarned: 0,
    creditsSpent: 0
  });
  let resourcesCollectedByType = $state<Record<string, number>>(
    Object.fromEntries(Object.keys(MATERIALS).map(key => [key, 0]))
  );

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function restoreNumber(value: unknown, fallback: number) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  function restoreNumberMap(value: unknown, fallback: Record<string, number>) {
    if (!isRecord(value)) return fallback;

    return Object.fromEntries(
      Object.entries(fallback).map(([key, defaultValue]) => [
        key,
        restoreNumber(value[key], defaultValue)
      ])
    );
  }

  function restoreStringList(value: unknown, fallback: string[]) {
    return Array.isArray(value) && value.every(item => typeof item === 'string')
      ? value
      : fallback;
  }

  function addResources(key: string, amount: number, source: 'player' | 'drone' | 'auto' = 'player') {
    materials[key] = (materials[key] || 0) + amount;
    const actualAmount = Math.max(0, amount);
    statistics.resourcesCollected += actualAmount;
    statistics[`${source}ResourcesCollected`] += actualAmount;
    resourcesCollectedByType[key] = (resourcesCollectedByType[key] || 0) + actualAmount;
  }

  function restoreStatistics(value: unknown) {
    if (!isRecord(value)) return;

    for (const key of Object.keys(statistics) as (keyof typeof statistics)[]) {
      statistics[key] = restoreNumber(value[key], statistics[key]);
    }
  }

  onMount(() => {
    try {
      const savedGame = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');

      if (isRecord(savedGame)) {
        activeTab = typeof savedGame.activeTab === 'string' ? savedGame.activeTab : activeTab;
        energy = restoreNumber(savedGame.energy, energy);
        maxEnergy = restoreNumber(savedGame.maxEnergy, maxEnergy);
        materials = restoreNumberMap(savedGame.materials, materials);
        credits = restoreNumber(savedGame.credits, credits);
        batteries = restoreNumber(savedGame.batteries, batteries);
        experiencePoints = restoreNumber(savedGame.experiencePoints, experiencePoints);
        deviceInventory = restoreNumberMap(savedGame.deviceInventory, deviceInventory);
        vehicleInventory = restoreNumberMap(savedGame.vehicleInventory, vehicleInventory);
        purchasedUpgrades = restoreStringList(savedGame.purchasedUpgrades, purchasedUpgrades);
        purchasedBaseUpgrades = restoreStringList(savedGame.purchasedBaseUpgrades, purchasedBaseUpgrades);
        completedQuestIds = restoreStringList(savedGame.completedQuestIds, completedQuestIds);
        restoreStatistics(savedGame.statistics);
        resourcesCollectedByType = restoreNumberMap(savedGame.resourcesCollectedByType, resourcesCollectedByType);
      }
    } catch {
      localStorage.removeItem(SAVE_KEY);
    } finally {
      saveReady = true;
    }
  });

  $effect(() => {
    if (!saveReady) return;

    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeTab,
      energy,
      maxEnergy,
      materials,
      credits,
      batteries,
      experiencePoints,
      deviceInventory,
      vehicleInventory,
      purchasedUpgrades,
      purchasedBaseUpgrades,
      completedQuestIds,
      statistics,
      resourcesCollectedByType
    }));
  });

  function isReqFulfilled(req: any) {
    if (req.type === 'material') {
      return (materials[req.id] || 0) >= req.amount;
    }
    if (req.type === 'upgrade') {
      return purchasedUpgrades.length >= req.count;
    }
    if (req.type === 'base_upgrade') {
      return purchasedBaseUpgrades.length >= req.count;
    }
    return false;
  }

  function canCompleteQuest(quest: typeof QUESTS[0]) {
    if (completedQuestIds.includes(quest.id)) return false;
    return quest.requirements.every(req => isReqFulfilled(req));
  }

  function completeQuest(quest: typeof QUESTS[0]) {
    if (!canCompleteQuest(quest)) return;

    for (const [matId, amount] of Object.entries(quest.rewards)) {
      addResources(matId, amount as number);
    }

    completedQuestIds.push(quest.id);
    statistics.questsCompleted += 1;
    awardExperience(XP_REWARDS.quest);
    questMessage = `🎉 Quest "${quest.title}" erfolgreich abgeschlossen! Belohnung erhalten.`;

    setTimeout(() => {
      if (questMessage.includes(quest.title)) {
        questMessage = '';
      }
    }, 4000);
  }

  // DYNAMISCHES ROBOTER-ICON
  let robotAvatar = $derived(() => {
    const hasLaser = purchasedUpgrades.some(id => id.startsWith('laser_cutter_mk'));
    const hasRadar = purchasedUpgrades.includes('radar_eyes');
    const hasBattery = purchasedUpgrades.includes('solar_battery');

    if (hasLaser && hasRadar && hasBattery) return '🤖⚡🔥';
    if (hasLaser && hasRadar) return '🪓🤖👁️';
    if (hasLaser) return '🤖🔥';
    if (hasRadar) return '🤖👁️';
    if (hasBattery) return '🤖⚡';
    return '🤖';
  });

  // LADESTATION LOGIK
  let chargeAmount = $derived(() => {
    if (purchasedBaseUpgrades.includes('charger_mk3')) return 50;
    if (purchasedBaseUpgrades.includes('charger_mk2')) return 25;
    if (purchasedBaseUpgrades.includes('charger_mk1')) return 10;
    return 10;
  });

  function rechargeEnergy() {
    energy = Math.min(maxEnergy, energy + chargeAmount());
  }

  // PASSIVES LADEN DURCH SOLARANLAGE
  $effect(() => {
    let solarAmount = 0;
    let solarIntervalMs = 3000;

    if (purchasedBaseUpgrades.includes('solar_mk3')) {
      solarAmount = 10;
      solarIntervalMs = 5000;
    } else if (purchasedBaseUpgrades.includes('solar_mk2')) {
      solarAmount = 3;
      solarIntervalMs = 5000;
    } else if (purchasedBaseUpgrades.includes('solar_mk1')) {
      solarAmount = 1;
    }

    if (solarAmount > 0) {
      const solarInterval = setInterval(() => {
        if (energy < maxEnergy) {
          energy = Math.min(maxEnergy, energy + solarAmount);
        }
      }, solarIntervalMs);
      return () => clearInterval(solarInterval);
    }
  });

  // PASSIVES AUTOMATISCHES ZERLEGEN
  $effect(() => {
    let dismantleIntervalMs = 0;

    if (purchasedBaseUpgrades.includes('repair_bench_mk3')) {
      dismantleIntervalMs = 20000;
    } else if (purchasedBaseUpgrades.includes('repair_bench_mk2')) {
      dismantleIntervalMs = 30000;
    } else if (purchasedBaseUpgrades.includes('repair_bench_mk1')) {
      dismantleIntervalMs = 60000;
    }

    if (dismantleIntervalMs === 0) return;

    const autoInterval = setInterval(() => {
      if (activeDismantleId) return;

      const availableItems = [
        ...ELECTRONICS.filter(item => deviceInventory[item.id] > 0).map(item => ({ item, isVehicle: false })),
        ...VEHICLES.filter(item => vehicleInventory[item.id] > 0).map(item => ({ item, isVehicle: true }))
      ];
      if (availableItems.length === 0) return;

      const selected = availableItems[Math.floor(Math.random() * availableItems.length)];
      const inventory = selected.isVehicle ? vehicleInventory : deviceInventory;
      inventory[selected.item.id] -= 1;

        for (const yieldItem of selected.item.yields) {
          addResources(yieldItem.id, yieldItem.amount, 'auto');
      }
        if (selected.isVehicle) statistics.autoVehiclesDismantled += 1;
        else statistics.autoElectronicsDismantled += 1;
    }, dismantleIntervalMs);

    return () => clearInterval(autoInterval);
  });

  // PASSIVES AUTOMATISCHES SUCHEN (SAMMEL-DROHNE)
  let lastDroneMessage = $state('');

  $effect(() => {
    let droneIntervalMs = 0;
    let droneEnergyCost = 0;

    if (purchasedBaseUpgrades.includes('scout_drone_mk3')) {
      droneIntervalMs = 10000;
      droneEnergyCost = 5;
    } else if (purchasedBaseUpgrades.includes('scout_drone_mk2')) {
      droneIntervalMs = 20000;
      droneEnergyCost = 8;
    } else if (purchasedBaseUpgrades.includes('scout_drone_mk1')) {
      droneIntervalMs = 30000;
      droneEnergyCost = 10;
    }

    if (droneIntervalMs === 0) return;

    const droneInterval = setInterval(() => {
      if (energy < droneEnergyCost) {
        lastDroneMessage = '🛸 Drohne wartet auf Akkuladung...';
        return;
      }

      energy -= droneEnergyCost;

      const rand = Math.random();
      let cumulative = 0;
      let found = null;

      for (const device of ELECTRONICS) {
        cumulative += device.findChance;
        if (rand <= cumulative) {
          found = device;
          break;
        }
      }

      if (found) {
        addToInventory(deviceInventory, found.id);
        statistics.electronicsFound += 1;
        statistics.droneElectronicsFound += 1;
        lastDroneMessage = `🛸 Drohne mitgebracht: ${found.icon} ${found.name}`;
      } else {
        addResources('scrap', 2, 'drone');
        lastDroneMessage = '🛸 Drohne mitgebracht: 2x Altmetall';
      }
    }, droneIntervalMs);

    return () => clearInterval(droneInterval);
  });

  // CHEAT-FUNKTIONEN FÜR DEV-PANEL
  function cheatAddMaterial(key: string, amount: number) {
    materials[key] = (materials[key] || 0) + amount;
  }

  function cheatSetAllMaterials(amount: number) {
    for (const key in materials) {
      materials[key] = amount;
    }
  }

  function cheatAddDevice(id: string, amount: number) {
    deviceInventory[id] = (deviceInventory[id] || 0) + amount;
  }

  function cheatAddVehicle(id: string, amount: number) {
    vehicleInventory[id] = (vehicleInventory[id] || 0) + amount;
  }

  function cheatFullEnergy() {
    energy = maxEnergy;
  }

  function cheatAddExperience(amount: number) {
    experiencePoints += Math.max(0, amount);
  }

  function cheatUnlockAllUpgrades() {
    for (const upgrade of ROBOT_UPGRADES) {
      const levels = robotUpgradeLevels(upgrade);
      const ids = levels.length > 0 ? levels.map(level => level.id) : [upgrade.id];
      for (const id of ids) {
        if (!purchasedUpgrades.includes(id)) purchasedUpgrades.push(id);
      }
    }

    for (const upgrade of BASE_UPGRADES) {
      const ids = upgrade.levels?.map(level => level.id) || [upgrade.id];
      for (const id of ids) {
        if (!purchasedBaseUpgrades.includes(id)) purchasedBaseUpgrades.push(id);
      }
    }

    maxEnergy = 150;
    energy = maxEnergy;
  }

  // KAUF-LOGIK (ROBOTER)
  type RobotUpgradeCost = { id: string; amount: number };
  type RobotUpgradeLevel = { id: string; name: string; speedMultiplier: number; costs: RobotUpgradeCost[] };

  function robotUpgradeLevels(upgrade: typeof ROBOT_UPGRADES[0]): RobotUpgradeLevel[] {
    if (upgrade.id === 'laser_cutter' && 'levels' in upgrade) {
      return upgrade.levels as RobotUpgradeLevel[];
    }
    return [];
  }

  function robotUpgradeCosts(upgrade: typeof ROBOT_UPGRADES[0]): RobotUpgradeCost[] {
    if ('costs' in upgrade) {
      return upgrade.costs as RobotUpgradeCost[];
    }
    return [];
  }

  function canAfford(upgrade: typeof ROBOT_UPGRADES[0]) {
    if (playerLevel < requiredUpgradeLevel(upgrade.id)) return false;
    const levels = robotUpgradeLevels(upgrade);
    if (levels.length > 0) {
      const nextLevel = levels.find(level => !purchasedUpgrades.includes(level.id));
      return nextLevel?.costs.every(cost => (materials[cost.id] || 0) >= cost.amount) ?? false;
    }
    return robotUpgradeCosts(upgrade).every(cost => (materials[cost.id] || 0) >= cost.amount);
  }

  function buyUpgrade(upgrade: typeof ROBOT_UPGRADES[0]) {
    const levels = robotUpgradeLevels(upgrade);
    if (!canAfford(upgrade)) return;

    if (levels.length > 0) {
      const nextLevel = levels.find(level => !purchasedUpgrades.includes(level.id));
      if (!nextLevel) return;
      for (const cost of nextLevel.costs) materials[cost.id] -= cost.amount;
      purchasedUpgrades.push(nextLevel.id);
      awardExperience(XP_REWARDS.upgrade);
      return;
    }

    if (purchasedUpgrades.includes(upgrade.id)) return;
    for (const cost of robotUpgradeCosts(upgrade)) materials[cost.id] -= cost.amount;
    purchasedUpgrades.push(upgrade.id);
    awardExperience(XP_REWARDS.upgrade);

    if (upgrade.id === 'solar_battery') {
      maxEnergy = 150;
      energy = 150;
    }
  }

  // KAUF-LOGIK (BASIS)
  type BaseUpgradeCost = { id: string; amount: number };

  function baseUpgradeCosts(upgrade: typeof BASE_UPGRADES[0]): BaseUpgradeCost[] {
    if ('costs' in upgrade && Array.isArray(upgrade.costs)) {
      return upgrade.costs as BaseUpgradeCost[];
    }
    return [];
  }

  function canAffordBase(upgrade: typeof BASE_UPGRADES[0]) {
    if (upgrade.id === 'charger_station' || upgrade.id === 'solar_station' || upgrade.id === 'scout_drone_station' || upgrade.id === 'repair_bench_station') {
      const nextLevel = upgrade.levels?.find(level => !purchasedBaseUpgrades.includes(level.id));
      return nextLevel?.costs.every(cost => (materials[cost.id] || 0) >= cost.amount) ?? false;
    }
    return baseUpgradeCosts(upgrade).every(cost => (materials[cost.id] || 0) >= cost.amount);
  }

  function buyBaseUpgrade(upgrade: typeof BASE_UPGRADES[0]) {
    if (!canAffordBase(upgrade)) return;

    if (upgrade.id === 'charger_station' || upgrade.id === 'solar_station' || upgrade.id === 'scout_drone_station' || upgrade.id === 'repair_bench_station') {
      const nextLevel = upgrade.levels?.find(level => !purchasedBaseUpgrades.includes(level.id));
      if (!nextLevel) return;
      for (const cost of nextLevel.costs) materials[cost.id] -= cost.amount;
      purchasedBaseUpgrades.push(nextLevel.id);
      return;
    }

    if (purchasedBaseUpgrades.includes(upgrade.id)) return;
    for (const cost of baseUpgradeCosts(upgrade)) materials[cost.id] -= cost.amount;
    purchasedBaseUpgrades.push(upgrade.id);
  }

  // SUCHEN LOGIK
  let lastFoundMessage = $state('');
  let lastVehicleMessage = $state('');
  let activeSearchType = $state<'electronics' | 'vehicles' | null>(null);
  let searchProgress = $state(0);
  let searchInterval: any = null;

  function resolveSearchResult(type: 'electronics' | 'vehicles') {
    const isElectronics = type === 'electronics';
    const list = isElectronics ? ELECTRONICS : VEHICLES;
    const hasRadar = purchasedUpgrades.includes('radar_eyes');
    const rand = Math.random();
    const weightedItems = list.map(item => ({
      item,
      weight: item.findChance + (hasRadar && item.findChance <= 0.05 ? 0.08 : 0)
    }));
    const totalWeight = weightedItems.reduce((total, entry) => total + entry.weight, 0);
    let cumulative = 0;
    let found = null;

    for (const entry of weightedItems) {
      cumulative += entry.weight / totalWeight;
      if (rand <= cumulative) {
        found = entry.item;
        break;
      }
    }

    if (isElectronics) {
      if (found) {
        addToInventory(deviceInventory, found.id);
        statistics.electronicsFound += 1;
        statistics.playerElectronicsFound += 1;
        awardExperience(XP_REWARDS.search + experienceForFoundItem(found));
        lastFoundMessage = `Gefunden: ${found.icon} ${found.name}!`;
      } else {
        awardExperience(XP_REWARDS.search);
        addResources('scrap', 2);
        lastFoundMessage = 'Kein Gerät gefunden, aber 2x Altmetall gesammelt.';
      }
      return;
    }

    if (found) {
      addToInventory(vehicleInventory, found.id);
      statistics.vehiclesFound += 1;
      statistics.playerVehiclesFound += 1;
      awardExperience(XP_REWARDS.search + experienceForFoundItem(found));
      lastVehicleMessage = `Gefunden: ${found.icon} ${found.name}!`;
    } else {
      awardExperience(XP_REWARDS.search);
      addResources('scrap', 4);
      lastVehicleMessage = 'Kein Auto gefunden, aber 4x Altmetall gesammelt.';
    }
  }

  function startSearch(type: 'electronics' | 'vehicles') {
    const isElectronics = type === 'electronics';
    const requiredEnergy = isElectronics ? 10 : 15;

    if (energy < requiredEnergy || activeSearchType) return;

    energy -= requiredEnergy;
    activeSearchType = type;
    searchProgress = 0;

    const durationMs = isElectronics ? 3500 : 5000;
    const stepTime = 100;
    const increment = (stepTime / durationMs) * 100;

    searchInterval = setInterval(() => {
      searchProgress += increment;

      if (searchProgress >= 100) {
        if (searchInterval) {
          clearInterval(searchInterval);
          searchInterval = null;
        }

        resolveSearchResult(type);
        activeSearchType = null;
        searchProgress = 0;
      }
    }, stepTime);
  }

  function searchElectronics() {
    startSearch('electronics');
  }

  function searchVehicles() {
    startSearch('vehicles');
  }

  function buyMaterial(key: string, amount: number = 1) {
    const count = Math.max(0, Math.floor(amount));
    if (count <= 0) return;

    const cost = marketBuyPrice(MATERIAL_SELL_VALUES[key] || 0) * count;
    if (credits < cost) return;

    credits -= cost;
    statistics.creditsSpent += cost;
    materials[key] = (materials[key] || 0) + count;
  }

  function buyDevice(item: typeof ELECTRONICS[0], amount: number = 1) {
    const count = Math.max(0, Math.floor(amount));
    if (count <= 0) return;

    const cost = marketBuyPrice(item.sellValue || 0) * count;
    if (credits < cost) return;

    credits -= cost;
    statistics.creditsSpent += cost;
    deviceInventory[item.id] = (deviceInventory[item.id] || 0) + count;
  }

  function buyVehicle(item: typeof VEHICLES[0], amount: number = 1) {
    const count = Math.max(0, Math.floor(amount));
    if (count <= 0) return;

    const cost = marketBuyPrice(item.sellValue || 0) * count;
    if (credits < cost) return;

    credits -= cost;
    statistics.creditsSpent += cost;
    vehicleInventory[item.id] = (vehicleInventory[item.id] || 0) + count;
  }

  function sellMaterial(key: string, amount: number = 1) {
    const available = materials[key] || 0;
    if (available <= 0 || amount <= 0) return;

    const actualAmount = Math.min(amount, available);
    const value = (MATERIAL_SELL_VALUES[key] || 0) * actualAmount;

    materials[key] = available - actualAmount;
    credits += value;
    statistics.creditsEarned += value;
  }

  function sellDevice(item: typeof ELECTRONICS[0], amount: number = 1) {
    const available = deviceInventory[item.id] || 0;
    if (available <= 0 || amount <= 0) return;

    const actualAmount = Math.min(amount, available);
    const value = (item.sellValue || 0) * actualAmount;

    deviceInventory[item.id] = available - actualAmount;
    credits += value;
    statistics.creditsEarned += value;
  }

  function sellVehicle(item: typeof VEHICLES[0], amount: number = 1) {
    const available = vehicleInventory[item.id] || 0;
    if (available <= 0 || amount <= 0) return;

    const actualAmount = Math.min(amount, available);
    const value = (item.sellValue || 0) * actualAmount;

    vehicleInventory[item.id] = available - actualAmount;
    credits += value;
    statistics.creditsEarned += value;
  }

  // ZERLEGEN LOGIK
  let activeDismantleId = $state<string | null>(null);
  let dismantleProgress = $state(0);
  let dismantleInterval: any = null;

  function startDismantling(item: any, isVehicle: boolean = false) {
    const inv = isVehicle ? vehicleInventory : deviceInventory;
    if (inv[item.id] <= 0 || activeDismantleId) return;

    activeDismantleId = item.id;
    dismantleProgress = 0;

    const speedBonus = purchasedUpgrades.includes('laser_cutter_mk3')
      ? 0.55
      : purchasedUpgrades.includes('laser_cutter_mk2')
        ? 0.70
        : purchasedUpgrades.includes('laser_cutter_mk1')
          ? 0.85
          : 1.0;
    const durationMs = item.dismantleTimeSec * 1000 * speedBonus;
    const stepTime = 50;
    const increment = (stepTime / durationMs) * 100;

    dismantleInterval = setInterval(() => {
      dismantleProgress += increment;

      if (dismantleProgress >= 100) {
        inv[item.id] -= 1;
        if (isVehicle) {
          statistics.vehiclesDismantled += 1;
          statistics.playerVehiclesDismantled += 1;
        } else {
          statistics.electronicsDismantled += 1;
          statistics.playerElectronicsDismantled += 1;
        }
        for (const yieldItem of item.yields) {
          addResources(yieldItem.id, yieldItem.amount);
        }
        awardExperience(XP_REWARDS.dismantle);
        dismantleProgress = 0;
        if (inv[item.id] <= 0) stopDismantling();
      }
    }, stepTime);
  }

  function stopDismantling() {
    if (dismantleInterval) {
      clearInterval(dismantleInterval);
      dismantleInterval = null;
    }
    activeDismantleId = null;
    dismantleProgress = 0;
  }
</script>

<div class="game-container">
  <GameHeader
    robotAvatar={robotAvatar()}
    {credits}
    {activeTab}
    {isAdmin}
    onTabChange={(tab) => activeTab = tab}
  />

  <div class="body-layout">
    <main class="game-main">

  <!-- TAB 1: BASIS & INVENTAR & ROBOTER-PROFIL -->
  {#if activeTab === 'basis'}
    <div class="tab-content">
      
      <!-- WIEDER EINGEFÜGT: VISUELLES ROBOTER-PROFIL / VISUALISIERUNG -->
      <div class="robot-display-card">
        <div class="robot-visual-large">
          <div class="robot-stage">{robotAvatar()}</div>
          <h3>ScrapBot Model-X</h3>
          <p class="robot-status">Status: Bereit & Einsatzfähig</p>
        </div>

        <div class="robot-installed-upgrades">
          <h4>🤖 Installierte Upgrades:</h4>
          {#if purchasedUpgrades.length === 0}
            <p class="no-upgrades">Noch keine Upgrades installiert.</p>
          {:else}
            <div class="equipped-tags">
              {#each purchasedUpgrades as upId}
                {@const upObj = ROBOT_UPGRADES.find(u => u.id === upId) || ROBOT_UPGRADES.find(u => robotUpgradeLevels(u).some(level => level.id === upId))}
                {@const upLevel = upObj ? robotUpgradeLevels(upObj).find(level => level.id === upId) : null}
                {#if upObj}
                  <span class="equipped-tag">
                    {upObj.icon} {upLevel?.name || upObj.name}
                  </span>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <h2>🏰 Hauptbasis & Ausbau</h2>

      <div class="base-upgrades-grid">
        {#each BASE_UPGRADES as baseUp}
          {@const isMultiLevel = baseUp.id === 'charger_station' || baseUp.id === 'solar_station' || baseUp.id === 'scout_drone_station' || baseUp.id === 'repair_bench_station'}
          {@const currentUpgradeLevel = isMultiLevel ? [...(baseUp.levels || [])].reverse().find(level => purchasedBaseUpgrades.includes(level.id)) : null}
          {@const nextUpgradeLevel = isMultiLevel ? baseUp.levels?.find(level => !purchasedBaseUpgrades.includes(level.id)) : null}
          {@const isBought = isMultiLevel ? !nextUpgradeLevel : purchasedBaseUpgrades.includes(baseUp.id)}
          {@const canBuy = canAffordBase(baseUp)}

          <div class="upgrade-card" class:bought={isBought}>
            <div class="upgrade-icon">{baseUp.icon}</div>
            <div class="upgrade-info">
              <h3>{currentUpgradeLevel?.name || baseUp.name}</h3>
              <p>{baseUp.description}</p>

              {#if !isBought}
                <div class="costs">
                  {#each (nextUpgradeLevel?.costs || baseUpgradeCosts(baseUp)) as cost}
                    <span class="cost-tag" class:has-enough={(materials[cost.id] || 0) >= cost.amount}>
                      {MATERIALS[cost.id]?.icon} {cost.amount} {MATERIALS[cost.id]?.name}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <button 
              class="buy-btn" 
              disabled={isBought || !canBuy} 
              onclick={() => buyBaseUpgrade(baseUp)}
            >
              {isBought ? '✓ Maximal ausgebaut' : isMultiLevel ? `${nextUpgradeLevel?.name} bauen` : 'Bauen'}
            </button>
          </div>
        {/each}
      </div>

      {#if lastDroneMessage}
        <div class="drone-status">{lastDroneMessage}</div>
      {/if}
    </div>
  {/if}

  <!-- TAB 2: LAGER -->
  {#if activeTab === 'lager'}
    <div class="tab-content">
      <h2>📦 Lagerbestand (Rohstoffe)</h2>
      <div class="materials-grid">
        {#each Object.entries(MATERIALS) as [key, mat]}
          <div class="material-card">
            <span class="mat-icon">{mat.icon}</span>
            <span class="mat-name">{mat.name}</span>
            <span class="mat-amount">{materials[key] || 0}</span>
            <span class="rarity-badge {rarityClass(mat.rarity)}">{mat.rarity}</span>
          </div>
        {/each}
      </div>

      <div class="rarity-table-section">
        <h3>Seltenheitsübersicht</h3>
        <div class="rarity-table">
          {#each Object.entries(MATERIALS) as [key, mat]}
            <div class="rarity-row">
              <span>{mat.icon} {mat.name}</span>
              <span class="rarity-badge {rarityClass(mat.rarity)}">{mat.rarity}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- TAB 3: MARKT -->
  {#if activeTab === 'markt'}
    <div class="tab-content">
      <h2>💰 Schrottmarkt</h2>
      <p class="tab-sub">Kaufe oder verkaufe Rohstoffe, Geräte und Fahrzeuge für Credits.</p>

      <div class="market-section battery-market-section">
        <h3>🔋 Batterien</h3>
        <div class="battery-market-card">
          <div class="battery-market-info">
            <span class="battery-icon">🔋</span>
            <div>
              <strong>Energie-Batterie</strong>
              <span>+{BATTERY_ENERGY} Energie pro Batterie</span>
            </div>
          </div>
          <div class="battery-market-actions">
            <span class="battery-stock">Im Lager: {batteries}</span>
            <label>
              Menge
              <input class="sell-input" type="number" min="1" bind:value={batteryMarketInput} />
            </label>
            <span class="battery-price">{BATTERY_PRICE * (Number(batteryMarketInput) || 1)} C</span>
            <button
              class="action-btn small"
              disabled={credits < BATTERY_PRICE * Math.max(1, Math.floor(Number(batteryMarketInput) || 1))}
              onclick={() => buyBatteries(Number(batteryMarketInput))}
            >
              Kaufen
            </button>
            <button class="action-btn small secondary" disabled={batteries <= 0 || energy >= maxEnergy} onclick={useBattery}>
              Einsetzen
            </button>
          </div>
        </div>
      </div>

      <div class="market-section">
        <h3>📦 Rohstoffe</h3>
        <div class="materials-grid market-materials-grid">
          {#each Object.entries(MATERIALS) as [key, mat]}
            {@const amount = materials[key] || 0}
            <div class="material-card market-material-card">
              <div class="market-material-content">
                <div class="market-material-info">
                  <span class="mat-icon">{mat.icon}</span>
                  <span class="mat-name">{mat.name}</span>
                  <span class="mat-amount">x{amount}</span>
                </div>
                <div class="market-sell-box">
                  <div class="market-sell-row">
                    <span class="market-label">Menge</span>
                    <input
                      class="sell-input"
                      type="number"
                      min="1"
                      max={Math.max(1, amount)}
                      inputmode="numeric"
                      aria-label="Menge für {mat.name}"
                      bind:value={materialSellInputs[key]}
                    />
                    <span class="sell-value">
                      Verkauf {(Number(materialSellInputs[key] ?? 1) || 1) * (MATERIAL_SELL_VALUES[key] || 0)} C
                      <span class="buy-value">Kauf {(Number(materialSellInputs[key] ?? 1) || 1) * marketBuyPrice(MATERIAL_SELL_VALUES[key] || 0)} C</span>
                    </span>
                  </div>
                  <div class="market-action-row">
                    <button
                      class="action-btn small"
                      onclick={() => {
                        const safeValue = normalizeMarketAmount(materialSellInputs[key], 1);
                        materialSellInputs[key] = safeValue;
                        buyMaterial(key, safeValue);
                      }}
                    >
                      Kaufen
                    </button>
                    <button
                      class="action-btn small secondary"
                      onclick={() => {
                        const safeValue = normalizeMarketAmount(materialSellInputs[key], 1, amount || 1);
                        materialSellInputs[key] = safeValue;
                        sellMaterial(key, safeValue);
                      }}
                    >
                      Verkaufen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="market-section">
        <h3>📺 Geräte</h3>
        <div class="items-grid">
          {#each ELECTRONICS as item}
            {@const count = deviceInventory[item.id] || 0}
            <div class="item-card">
              <div class="item-header">
                <span class="item-icon">{item.icon}</span>
                <span class="item-name">{item.name}</span>
                <span class="item-count">{count}x</span>
              </div>
              <div class="market-sell-box">
                <div class="market-sell-row">
                  <span class="market-label">Menge</span>
                  <input
                    class="sell-input"
                    type="number"
                    min="1"
                    max={Math.max(1, count)}
                    inputmode="numeric"
                    aria-label="Menge für {item.name}"
                    bind:value={deviceMarketInputs[item.id]}
                  />
                  <span class="sell-value">
                    = {((Number(deviceMarketInputs[item.id] ?? 1) || 1) * (item.sellValue || 0))} C
                  </span>
                </div>
                <div class="market-action-row">
                  <button
                    class="action-btn small"
                    onclick={() => {
                      const safeValue = normalizeMarketAmount(deviceMarketInputs[item.id], 1);
                      deviceMarketInputs[item.id] = safeValue;
                      buyDevice(item, safeValue);
                    }}
                  >
                    Kaufen
                  </button>
                  <button
                    class="action-btn small secondary"
                    onclick={() => {
                      const safeValue = normalizeMarketAmount(deviceMarketInputs[item.id], 1, count || 1);
                      deviceMarketInputs[item.id] = safeValue;
                      sellDevice(item, safeValue);
                    }}
                  >
                    Verkaufen
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="market-section">
        <h3>🚗 Fahrzeuge</h3>
        <div class="items-grid">
          {#each VEHICLES as item}
            {@const count = vehicleInventory[item.id] || 0}
            <div class="item-card">
              <div class="item-header">
                <span class="item-icon">{item.icon}</span>
                <span class="item-name">{item.name}</span>
                <span class="item-count">{count}x</span>
              </div>
              <div class="market-sell-box">
                <div class="market-sell-row">
                  <span class="market-label">Menge</span>
                  <input
                    class="sell-input"
                    type="number"
                    min="1"
                    max={Math.max(1, count)}
                    inputmode="numeric"
                    aria-label="Menge für {item.name}"
                    bind:value={vehicleMarketInputs[item.id]}
                  />
                  <span class="sell-value">
                    = {((Number(vehicleMarketInputs[item.id] ?? 1) || 1) * (item.sellValue || 0))} C
                  </span>
                </div>
                <div class="market-action-row">
                  <button
                    class="action-btn small"
                    onclick={() => {
                      const safeValue = normalizeMarketAmount(vehicleMarketInputs[item.id], 1);
                      vehicleMarketInputs[item.id] = safeValue;
                      buyVehicle(item, safeValue);
                    }}
                  >
                    Kaufen
                  </button>
                  <button
                    class="action-btn small secondary"
                    onclick={() => {
                      const safeValue = normalizeMarketAmount(vehicleMarketInputs[item.id], 1, count || 1);
                      vehicleMarketInputs[item.id] = safeValue;
                      sellVehicle(item, safeValue);
                    }}
                  >
                    Verkaufen
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- TAB 4: SCHROTTSUCHE -->
  {#if activeTab === 'schrott'}
    <div class="tab-content">
      <h2>🔍 Schrottplatz durchsuchen</h2>
      
      <div class="search-section">
        <div class="search-card">
          <h3>📺 Elektrogeräte-Areal</h3>
          <p>Kleine bis mittlere Elektronik. Verbraucht 10⚡.</p>
          <button class="action-btn" onclick={searchElectronics} disabled={energy < 10 || activeSearchType !== null}>
            {activeSearchType === 'electronics' ? '🔍 Suche läuft...' : '🔍 Nach Geräten suchen (10⚡)'}
          </button>
          {#if activeSearchType === 'electronics'}
            <div class="progress-bar" style="margin-top: 0.8rem;">
              <div class="progress-fill" style="width: {searchProgress}%"></div>
            </div>
            <p class="status-msg">Suche läuft... {Math.max(0, Math.round(100 - searchProgress))}%</p>
          {/if}
          {#if lastFoundMessage}<p class="status-msg">{lastFoundMessage}</p>{/if}
        </div>

        <div class="search-card">
          <h3>🚗 Autofriedhof</h3>
          <p>Fahrzeuge & schwere Mechanik. Verbraucht 15⚡.</p>
          <button class="action-btn" onclick={searchVehicles} disabled={energy < 15 || activeSearchType !== null}>
            {activeSearchType === 'vehicles' ? '🏎️ Suche läuft...' : '🏎️ Nach Autos suchen (15⚡)'}
          </button>
          {#if activeSearchType === 'vehicles'}
            <div class="progress-bar" style="margin-top: 0.8rem;">
              <div class="progress-fill" style="width: {searchProgress}%"></div>
            </div>
            <p class="status-msg">Suche läuft... {Math.max(0, Math.round(100 - searchProgress))}%</p>
          {/if}
          {#if lastVehicleMessage}<p class="status-msg">{lastVehicleMessage}</p>{/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- TAB 3: ZERLEGEN -->
  {#if activeTab === 'zerlegen'}
    <div class="tab-content">
      <h2>⚙️ Zerlege-Werkbank</h2>

      <h3>📺 Gefundene Elektrogeräte</h3>
      <div class="items-grid">
        {#each ELECTRONICS as item}
          {@const count = deviceInventory[item.id] || 0}
          <div class="item-card" class:disabled={count <= 0}>
            <div class="item-header">
              <span class="item-icon">{item.icon}</span>
              <span class="item-name">{item.name}</span>
              <span class="item-count">x{count}</span>
            </div>

            <div class="yield-info">
              <span class="yield-label">Ertrag:</span>
              <div class="yield-list">
                {#each item.yields as yieldItem}
                  <span class="yield-item">
                    {MATERIALS[yieldItem.id]?.icon} {yieldItem.amount}x {MATERIALS[yieldItem.id]?.name}
                    <span class="yield-rarity {rarityClass(MATERIALS[yieldItem.id]?.rarity || 'gewöhnlich')}">{MATERIALS[yieldItem.id]?.rarity}</span>
                  </span>
                {/each}
              </div>
            </div>

            {#if activeDismantleId === item.id}
              <div class="progress-bar">
                <div class="progress-fill" style="width: {dismantleProgress}%"></div>
              </div>
            {/if}

            <button 
              class="dismantle-btn" 
              disabled={count <= 0 || (activeDismantleId !== null && activeDismantleId !== item.id)}
              onclick={() => activeDismantleId === item.id ? stopDismantling() : startDismantling(item, false)}
            >
              {activeDismantleId === item.id ? '⏹ Abbrechen' : 'Zerlegen'}
            </button>
          </div>
        {/each}
      </div>

      <h3 style="margin-top: 2rem;">🚗 Gefundene Fahrzeuge</h3>
      <div class="items-grid">
        {#each VEHICLES as vehicle}
          {@const count = vehicleInventory[vehicle.id] || 0}
          <div class="item-card" class:disabled={count <= 0}>
            <div class="item-header">
              <span class="item-icon">{vehicle.icon}</span>
              <span class="item-name">{vehicle.name}</span>
              <span class="item-count">x{count}</span>
            </div>

            <div class="yield-info">
              <span class="yield-label">Ertrag:</span>
              <div class="yield-list">
                {#each vehicle.yields as yieldItem}
                  <span class="yield-item">
                    {MATERIALS[yieldItem.id]?.icon} {yieldItem.amount}x {MATERIALS[yieldItem.id]?.name}
                    <span class="yield-rarity {rarityClass(MATERIALS[yieldItem.id]?.rarity || 'gewöhnlich')}">{MATERIALS[yieldItem.id]?.rarity}</span>
                  </span>
                {/each}
              </div>
            </div>

            {#if activeDismantleId === vehicle.id}
              <div class="progress-bar">
                <div class="progress-fill" style="width: {dismantleProgress}%"></div>
              </div>
            {/if}

            <button 
              class="dismantle-btn" 
              disabled={count <= 0 || (activeDismantleId !== null && activeDismantleId !== vehicle.id)}
              onclick={() => activeDismantleId === vehicle.id ? stopDismantling() : startDismantling(vehicle, true)}
            >
              {activeDismantleId === vehicle.id ? '⏹ Abbrechen' : 'Zerlegen'}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- TAB 4: UPGRADES -->
  {#if activeTab === 'upgrades'}
    <div class="tab-content">
      <h2>🤖 Roboter-Modifikationen</h2>

      <div class="upgrades-list">
        {#each ROBOT_UPGRADES as up}
          {@const upgradeLevels = robotUpgradeLevels(up)}
          {@const currentUpgradeLevel = [...upgradeLevels].reverse().find(level => purchasedUpgrades.includes(level.id))}
          {@const nextUpgradeLevel = upgradeLevels.find(level => !purchasedUpgrades.includes(level.id))}
          {@const isBought = upgradeLevels.length > 0 ? !nextUpgradeLevel : purchasedUpgrades.includes(up.id)}
          {@const canBuy = canAfford(up)}
          {@const requiredLevel = requiredUpgradeLevel(up.id)}

          <div class="upgrade-card" class:bought={isBought}>
            <div class="upgrade-icon">{up.icon}</div>
            <div class="upgrade-info">
              <h3>{currentUpgradeLevel?.name || up.name} <span class="category">({up.category})</span></h3>
              <p>{up.description}</p>

              {#if !isBought}
                <div class="costs">
                  {#each (nextUpgradeLevel?.costs || robotUpgradeCosts(up)) as cost}
                    <span class="cost-tag" class:has-enough={(materials[cost.id] || 0) >= cost.amount}>
                      {MATERIALS[cost.id]?.icon} {cost.amount} {MATERIALS[cost.id]?.name}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <button 
              class="buy-btn" 
              disabled={isBought || !canBuy} 
              onclick={() => buyUpgrade(up)}
            >
              {isBought ? '✓ Maximal ausgebaut' : playerLevel < requiredLevel ? `🔒 Ab Level ${requiredLevel}` : nextUpgradeLevel ? `${nextUpgradeLevel.name} kaufen` : 'Kaufen'}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- TAB 5: AUFTRÄGE & QUESTS -->
  {#if activeTab === 'quests'}
    <div class="tab-content">
      <h2>📜 Hauptquartier-Aufträge</h2>
      <p class="tab-sub">Erfülle Aufgaben für das HQ, um wertvolle Rohstoff-Pakete und Boni zu erhalten!</p>

      {#if questMessage}
        <div class="quest-alert">{questMessage}</div>
      {/if}

      <div class="quests-grid">
        {#each QUESTS as quest}
          {@const isDone = completedQuestIds.includes(quest.id)}
          {@const canClaim = canCompleteQuest(quest)}

          <div class="quest-card" class:completed={isDone}>
            <div class="quest-header">
              <h3>{quest.title}</h3>
              {#if isDone}
                <span class="badge-done">✅ Abgeschlossen</span>
              {/if}
            </div>

            <p class="quest-desc">{quest.description}</p>

            <div class="quest-section">
              <span class="section-title">Anforderungen:</span>
              <ul class="req-list">
                {#each quest.requirements as req}
                  {@const fulfilled = isReqFulfilled(req)}
                  <li class:fulfilled={fulfilled}>
                    {fulfilled ? '✔' : '❌'} {req.label}
                  </li>
                {/each}
              </ul>
            </div>

            <div class="quest-section">
              <span class="section-title">Belohnung:</span>
              <div class="reward-tags">
                {#each Object.entries(quest.rewards) as [matId, amount]}
                  <span class="reward-tag">
                    {MATERIALS[matId]?.icon || '📦'} +{amount} {MATERIALS[matId]?.name || matId}
                  </span>
                {/each}
                <span class="reward-tag quest-xp-reward">
                  ✨ +{XP_REWARDS.quest} XP
                </span>
              </div>
            </div>

            {#if !isDone}
              <button 
                class="quest-btn" 
                disabled={!canClaim} 
                onclick={() => completeQuest(quest)}
              >
                {canClaim ? '🎁 Belohnung abholen' : '⏳ Noch nicht erfüllt'}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- TAB 6: STATISTIK -->
  {#if activeTab === 'stats'}
    <div class="tab-content">
      <h2>📊 ScrapBot-Statistik</h2>
      <p class="tab-sub">Deine bisherige Leistung im Hauptquartier auf einen Blick.</p>

      <h3 class="statistics-heading">Vom Spieler</h3>
      <div class="statistics-grid">
        <div class="stat-card"><span class="stat-icon">📦</span><strong>{statistics.playerResourcesCollected}</strong><span>Ressourcen gesammelt</span></div>
        <div class="stat-card"><span class="stat-icon">🚗</span><strong>{statistics.playerVehiclesFound}</strong><span>Autos gefunden</span></div>
        <div class="stat-card"><span class="stat-icon">🔧</span><strong>{statistics.playerVehiclesDismantled}</strong><span>Autos zerlegt</span></div>
        <div class="stat-card"><span class="stat-icon">📻</span><strong>{statistics.playerElectronicsFound}</strong><span>Geräte gefunden</span></div>
        <div class="stat-card"><span class="stat-icon">⚙️</span><strong>{statistics.playerElectronicsDismantled}</strong><span>Geräte zerlegt</span></div>
      </div>

      <h3 class="statistics-heading">Automatische Systeme</h3>
      <div class="statistics-grid">
        <div class="stat-card"><span class="stat-icon">🛸</span><strong>{statistics.droneResourcesCollected}</strong><span>Drohnen-Ressourcen</span></div>
        <div class="stat-card"><span class="stat-icon">📡</span><strong>{statistics.droneElectronicsFound}</strong><span>Drohnen-Funde</span></div>
        <div class="stat-card"><span class="stat-icon">🏗️</span><strong>{statistics.autoResourcesCollected}</strong><span>Kran-Ressourcen</span></div>
        <div class="stat-card"><span class="stat-icon">⚙️</span><strong>{statistics.autoElectronicsDismantled}</strong><span>Geräte automatisch zerlegt</span></div>
        <div class="stat-card"><span class="stat-icon">🚗</span><strong>{statistics.autoVehiclesDismantled}</strong><span>Autos automatisch zerlegt</span></div>
      </div>

      <h3 class="statistics-heading">Gesamt und Fortschritt</h3>
      <div class="statistics-grid">
        <div class="stat-card"><span class="stat-icon">📦</span><strong>{statistics.resourcesCollected}</strong><span>Ressourcen insgesamt</span></div>
        <div class="stat-card"><span class="stat-icon">🚗</span><strong>{statistics.vehiclesFound}</strong><span>Autos insgesamt gefunden</span></div>
        <div class="stat-card"><span class="stat-icon">🔧</span><strong>{statistics.vehiclesDismantled}</strong><span>Autos insgesamt zerlegt</span></div>
        <div class="stat-card"><span class="stat-icon">📻</span><strong>{statistics.electronicsFound}</strong><span>Geräte insgesamt gefunden</span></div>
        <div class="stat-card"><span class="stat-icon">⚙️</span><strong>{statistics.electronicsDismantled}</strong><span>Geräte insgesamt zerlegt</span></div>
        <div class="stat-card"><span class="stat-icon">📜</span><strong>{statistics.questsCompleted}</strong><span>Aufträge erledigt</span></div>
        <div class="stat-card"><span class="stat-icon">💰</span><strong>{statistics.creditsEarned}</strong><span>Credits verdient</span></div>
        <div class="stat-card"><span class="stat-icon">🛒</span><strong>{statistics.creditsSpent}</strong><span>Credits ausgegeben</span></div>
      </div>

      <h3 class="statistics-heading">Insgesamt gesammelte Rohstoffe</h3>
      <div class="statistics-materials">
        {#each Object.entries(MATERIALS) as [key, material]}
          <div class="statistics-material">
            <span>{material.icon} {material.name}</span>
            <strong>{resourcesCollectedByType[key] || 0}</strong>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- TAB 7: DEV PANEL -->
  {#if activeTab === 'dev' && isAdmin}
    <div class="tab-content dev-panel">
      <h2>🛠️ Entwickler & Cheat Panel</h2>
      
      <div class="cheat-section">
        <h3>⚡ Schnell-Aktionen</h3>
        <div class="cheat-actions">
          <button class="cheat-btn highlight" onclick={cheatFullEnergy}>⚡ Energie voll aufladen (100%)</button>
          <button class="cheat-btn highlight" onclick={() => cheatAddExperience(100)}>✨ +100 XP</button>
          <button class="cheat-btn highlight" onclick={() => cheatAddExperience(1000)}>🚀 +1.000 XP</button>
          <button class="cheat-btn highlight" onclick={cheatUnlockAllUpgrades}>🤖 Alle Upgrades freischalten</button>
          <button class="cheat-btn highlight" onclick={() => cheatSetAllMaterials(500)}>📦 Alle Rohstoffe auf 500 setzen</button>
          <button class="cheat-btn highlight" onclick={() => cheatSetAllMaterials(5000)}>🚀 Max Ressourcen (5.000)</button>
        </div>
      </div>

      <div class="cheat-section">
        <h3>📦 Rohstoffe einzeln hinzufügen (+50)</h3>
        <div class="cheat-grid">
          {#each Object.entries(MATERIALS) as [key, mat]}
            <button class="cheat-btn" onclick={() => cheatAddMaterial(key, 50)}>
              {mat.icon} +50 {mat.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="cheat-section">
        <h3>📺 Elektrogeräte hinzufügen (+3)</h3>
        <div class="cheat-grid">
          {#each ELECTRONICS as item}
            <button class="cheat-btn" onclick={() => cheatAddDevice(item.id, 3)}>
              {item.icon} +3 {item.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="cheat-section">
        <h3>🚗 Fahrzeuge hinzufügen (+2)</h3>
        <div class="cheat-grid">
          {#each VEHICLES as vehicle}
            <button class="cheat-btn" onclick={() => cheatAddVehicle(vehicle.id, 2)}>
              {vehicle.icon} +2 {vehicle.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

    </main>

    <RobotSidebar
      {playerLevel}
      {experiencePoints}
      {currentLevelXp}
      {nextLevelXp}
      {energy}
      {maxEnergy}
    />
  </div>

  <!-- FOOTER / ADMIN LOGIN -->
  <footer class="game-footer">
    {#if !isAdmin}
      <div class="admin-login-box">
        <input 
          type="password" 
          placeholder="Admin Passwort..." 
          bind:value={adminPasswordInput}
          onkeydown={(e) => e.key === 'Enter' && loginAdmin()}
        />
        <button onclick={loginAdmin}>🛠️ Dev Login</button>
      </div>
      {#if adminError}<p class="admin-error">{adminError}</p>{/if}
    {:else}
      <div class="admin-logged-in">
        <span>🛠️ Admin-Modus Aktiv</span>
        <button onclick={logoutAdmin}>Ausloggen</button>
      </div>
    {/if}
  </footer>
</div>

<style>
  .game-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #f1f5f9;
    background: #0f172a;
    min-height: 100vh;
  }

  .body-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 280px;
    align-items: stretch;
    gap: 1.5rem;
  }

  .game-main {
    min-width: 0;
  }

  @media (max-width: 760px) {
    .body-layout {
      grid-template-columns: 1fr;
    }
  }

  .tab-content {
    background: #1e293b;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #334155;
  }

  .tab-sub {
    color: #94a3b8;
    margin-top: -0.5rem;
    margin-bottom: 1.5rem;
  }

  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
  }

  .stat-card .stat-icon {
    font-size: 1.35rem;
  }

  .stat-card strong {
    font-size: 1.5rem;
    color: #f8fafc;
  }

  .stat-card span:last-child {
    color: #94a3b8;
    font-size: 0.8rem;
  }

  .statistics-heading {
    margin: 1.75rem 0 0.75rem;
  }

  .statistics-materials {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.5rem;
  }

  .statistics-material {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: #cbd5e1;
  }

  .statistics-material strong {
    color: #f8fafc;
  }

  /* STYLES FÜR ROBOTER-PROFIL CARD */
  .robot-display-card {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .robot-visual-large {
    text-align: center;
    background: #1e293b;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    border: 1px solid #334155;
    min-width: 180px;
  }

  .robot-stage {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .robot-visual-large h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .robot-status {
    margin: 0.2rem 0 0 0;
    font-size: 0.8rem;
    color: #4ade80;
  }

  .robot-installed-upgrades {
    flex: 1;
  }

  .robot-installed-upgrades h4 {
    margin: 0 0 0.75rem 0;
    color: #cbd5e1;
  }

  .no-upgrades {
    color: #64748b;
    font-style: italic;
    margin: 0;
  }

  .equipped-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .equipped-tag {
    background: #1e293b;
    border: 1px solid #2563eb;
    color: #f1f5f9;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .drone-status {
    background: #0f172a;
    border: 1px solid #334155;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    color: #38bdf8;
    font-weight: 500;
  }

  .materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }

  .material-card {
    background: #0f172a;
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #334155;
  }

  .market-material-card {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 0.75rem;
  }

  .market-material-card .mat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 1.6rem;
    text-align: center;
  }

  .market-material-content {
    flex: 1;
    min-width: 0;
  }

  .market-material-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .market-materials-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .market-material-card .mat-name {
    display: block;
    text-align: left;
  }

  .market-material-card .mat-amount {
    display: block;
  }

  .mat-icon { font-size: 1.5rem; }
  .mat-name { font-size: 0.8rem; color: #94a3b8; text-align: center; }
  .mat-amount { font-size: 1.1rem; font-weight: bold; }

  .rarity-badge {
    display: inline-block;
    margin-top: 0.3rem;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .rarity-gewöhnlich {
    background: #334155;
    color: #cbd5e1;
  }

  .rarity-selten {
    background: #164e63;
    color: #67e8f9;
  }

  .rarity-episch {
    background: #581c87;
    color: #e9d5ff;
  }

  .rarity-table-section {
    margin-top: 1.5rem;
  }

  .rarity-table-section h3 {
    margin-bottom: 0.65rem;
  }

  .rarity-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 0.4rem;
  }

  .rarity-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0.7rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 0.82rem;
  }

  .search-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .search-card {
    background: #0f172a;
    padding: 1.25rem;
    border-radius: 10px;
    border: 1px solid #334155;
  }

  .action-btn {
    width: 100%;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
  }

  .action-btn.small {
    width: auto;
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
    line-height: 1.2;
    min-width: 62px;
  }

  .action-btn.small.secondary {
    background: #475569;
  }

  .action-btn:disabled {
    background: #475569;
    cursor: not-allowed;
  }

  .market-section {
    margin-top: 1.25rem;
  }

  .battery-market-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
  }

  .battery-market-info,
  .battery-market-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .battery-market-info > div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .battery-market-info span:last-child {
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .battery-icon {
    font-size: 2rem;
  }

  .battery-market-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .battery-market-actions label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .battery-stock,
  .battery-price {
    color: #facc15;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  @media (max-width: 760px) {
    .battery-market-card {
      align-items: stretch;
      flex-direction: column;
    }

    .battery-market-actions {
      justify-content: flex-start;
    }
  }

  .market-sell-box {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    min-width: 0;
    margin-top: 0.65rem;
  }

  .market-sell-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
  }

  .market-label {
    font-size: 0.7rem;
    color: #94a3b8;
    min-width: 42px;
  }

  .sell-input {
    width: 64px;
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid #475569;
    border-radius: 6px;
    padding: 0.35rem 0.4rem;
    text-align: center;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .sell-value {
    color: #facc15;
    font-size: 0.8rem;
    font-weight: 600;
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
  }

  .buy-value {
    display: block;
    color: #4ade80;
    font-size: 0.72rem;
    font-weight: 500;
  }

  .market-action-row {
    display: flex;
    gap: 0.35rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .status-msg {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #4ade80;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .item-card {
    background: #0f172a;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #334155;
  }

  .item-card.disabled { opacity: 0.5; }

  .yield-info {
    margin: 0.75rem 0;
    padding-top: 0.65rem;
    border-top: 1px solid #334155;
  }

  .yield-label {
    display: block;
    margin-bottom: 0.4rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .yield-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .yield-item {
    background: #1e293b;
    border-radius: 4px;
    color: #cbd5e1;
    font-size: 0.72rem;
    padding: 0.25rem 0.4rem;
  }

  .yield-rarity {
    display: inline-block;
    margin-left: 0.2rem;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .item-count { margin-left: auto; font-weight: bold; }

  .dismantle-btn {
    width: 100%;
    padding: 0.5rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }

  .dismantle-btn:disabled {
    background: #475569;
    cursor: not-allowed;
  }

  .progress-bar {
    height: 6px;
    background: #334155;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: #10b981;
  }

  .upgrades-list, .base-upgrades-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .upgrade-card {
    display: flex;
    gap: 1rem;
    background: #0f172a;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #334155;
    align-items: center;
  }

  .upgrade-card.bought { border-color: #059669; }

  .upgrade-icon { font-size: 2rem; }
  .upgrade-info { flex: 1; }
  .upgrade-info h3 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
  .upgrade-info p { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #94a3b8; }

  .category { font-size: 0.8rem; color: #64748b; font-weight: normal; }

  .costs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .cost-tag {
    font-size: 0.75rem;
    background: #1e293b;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: #ef4444;
  }
  .cost-tag.has-enough { color: #22c55e; }

  .buy-btn {
    padding: 0.6rem 1.2rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
  }

  .buy-btn:disabled { background: #475569; cursor: not-allowed; }

  /* QUEST STYLES */
  .quest-alert {
    background: #15803d;
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .quests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .quest-card {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .quest-card.completed {
    opacity: 0.6;
    border-color: #166534;
  }

  .quest-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .quest-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #f8fafc;
  }

  .badge-done {
    background: #166534;
    color: #4ade80;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .quest-desc {
    color: #94a3b8;
    font-size: 0.88rem;
    margin: 0;
    line-height: 1.4;
  }

  .section-title {
    display: block;
    font-size: 0.8rem;
    font-weight: bold;
    color: #cbd5e1;
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .req-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.85rem;
  }

  .req-list li {
    color: #f87171;
    margin-bottom: 0.2rem;
  }

  .req-list li.fulfilled {
    color: #4ade80;
  }

  .reward-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .reward-tag {
    background: #1e293b;
    color: #f1f5f9;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .quest-btn {
    width: 100%;
    padding: 0.65rem;
    border: none;
    border-radius: 8px;
    background: #2563eb;
    color: white;
    font-weight: bold;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.2s;
  }

  .quest-btn:disabled {
    background: #334155;
    color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.8;
  }

  .quest-btn:not(:disabled):hover {
    background: #1d4ed8;
  }

  /* DEV PANEL */
  .dev-panel { background: #18181b; border-color: #3f3f46; }
  .cheat-section { margin-bottom: 1.5rem; }
  .cheat-section h3 { margin-bottom: 0.5rem; color: #a1a1aa; font-size: 0.9rem; }
  .cheat-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .cheat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; }
  .cheat-btn {
    padding: 0.5rem;
    background: #27272a;
    color: #d4d4d8;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    text-align: left;
  }
  .cheat-btn.highlight { background: #0284c7; color: white; border: none; font-weight: bold; }

  /* FOOTER */
  .game-footer {
    margin-top: 2rem;
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #334155;
  }
  .admin-login-box { display: flex; justify-content: center; gap: 0.5rem; }
  .admin-login-box input {
    background: #1e293b;
    border: 1px solid #334155;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
  }
  .admin-login-box button {
    background: #475569;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .admin-error { color: #ef4444; font-size: 0.8rem; margin-top: 0.5rem; }
  .admin-logged-in { display: flex; justify-content: center; align-items: center; gap: 1rem; color: #4ade80; }
  .admin-logged-in button { background: #dc2626; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; }
</style>