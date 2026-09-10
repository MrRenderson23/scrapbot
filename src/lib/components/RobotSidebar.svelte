<script lang="ts">
  import { ROBOT_UPGRADES } from '$lib/data.js';
  import { requiredUpgradeLevel } from '$lib/game/progression.js';

  let {
    playerLevel,
    experiencePoints,
    currentLevelXp,
    nextLevelXp,
    energy,
    maxEnergy,
    purchasedUpgrades,
    batteries,
    robotAvatar,
    activeDismantle,
    activeSearch,
    onUseBattery
  } = $props<{
    playerLevel: number;
    experiencePoints: number;
    currentLevelXp: number;
    nextLevelXp: number;
    energy: number;
    maxEnergy: number;
    purchasedUpgrades: string[];
    batteries: number;
    robotAvatar: string;
    activeDismantle: boolean;
    activeSearch: boolean;
    onUseBattery: () => void;
  }>();

  function upgradeLevels(upgrade: typeof ROBOT_UPGRADES[0]) {
    return 'levels' in upgrade ? upgrade.levels : [];
  }

  function hasUpgrade(prefix: string) {
    return purchasedUpgrades.some((id: string) => id.startsWith(prefix));
  }
</script>

<aside class="robot-sidebar" aria-label="Roboterprofil">
  <div class="robot-visual">
    <div class="robot-scene">
      <div class="robot-platform"></div>
      <div class="robot-figure" class:robot-low-energy={energy < maxEnergy * 0.2}>
        <div class="robot-sensor-bar">
          <span class:installed={hasUpgrade('radar_eyes_mk')}></span>
          <span class:installed={hasUpgrade('radar_eyes_mk')}></span>
        </div>
        <div class="robot-head">
          <span class="robot-eye" class:radar-active={hasUpgrade('radar_eyes_mk')}></span>
          <span class="robot-eye" class:radar-active={hasUpgrade('radar_eyes_mk')}></span>
        </div>
        <div class="robot-body">
          <span class="robot-core" class:core-active={hasUpgrade('solar_battery_mk')}></span>
        </div>
        <div class="robot-arm robot-arm-left" class:has-diamond-blade={hasUpgrade('diamond_blade_mk')}></div>
        <div class="robot-arm robot-arm-right" class:has-cutter={hasUpgrade('laser_cutter_mk')}></div>
        <div class="robot-leg robot-leg-left"></div>
        <div class="robot-leg robot-leg-right"></div>
      </div>
    </div>
    <div class="robot-avatar-caption">{robotAvatar}</div>
    <h3>ScrapBot Model-X</h3>
    <p class="robot-status">
      {#if activeDismantle}Status: Zerlegevorgang läuft
      {:else if activeSearch}Status: Suche läuft
      {:else if energy < maxEnergy * 0.2}Status: Energie niedrig
      {:else}Status: Bereit & Einsatzfähig{/if}
    </p>
    <div class="energy-controls">
      <span>Energie: {energy} / {maxEnergy}</span>
      <span>🔋 Batterien: {batteries}</span>
      <button class="action-btn small secondary" disabled={batteries <= 0 || energy >= maxEnergy} onclick={onUseBattery}>
        🔋 Batterie einsetzen (+50 Energie)
      </button>
    </div>
  </div>
  <div class="robot-sidebar-divider"></div>
  <div class="robot-sidebar-placeholder">
    <span>Erfahrungsstufe</span>
    <strong>Level {playerLevel}</strong>
    <div class="xp-track" aria-label="Erfahrungsfortschritt">
      <div class="xp-fill" style={`width: ${Math.min(100, (currentLevelXp / nextLevelXp) * 100)}%`}></div>
    </div>
    <small>{experiencePoints} XP gesamt · {currentLevelXp} / {nextLevelXp} XP bis zum nächsten Level</small>
  </div>
  <div class="robot-sidebar-placeholder">
    <div class="sidebar-section-title">
      <span>Energie</span>
      <strong>⚡ {energy} / {maxEnergy}</strong>
    </div>
    <div class="energy-track" aria-label="Energie-Fortschritt">
      <div class="energy-fill" style={`width: ${Math.min(100, (energy / maxEnergy) * 100)}%`}></div>
    </div>
  </div>
  <div class="robot-sidebar-placeholder">
    <span>Upgrades</span>
    <div class="sidebar-upgrade-list">
      {#each ROBOT_UPGRADES as upgrade}
        {@const levels = upgradeLevels(upgrade)}
        {@const installedLevel = levels.length > 0
          ? [...levels].reverse().find(level => purchasedUpgrades.includes(level.id))
          : null}
        {@const isInstalled = installedLevel !== null || purchasedUpgrades.includes(upgrade.id)}
        {@const requiredLevel = requiredUpgradeLevel(upgrade.id)}
        <div class="sidebar-upgrade-row" class:upgrade-installed={isInstalled}>
          <span class="sidebar-upgrade-name">{upgrade.icon} {installedLevel?.name || upgrade.name}</span>
          {#if isInstalled}
            <small>Installiert</small>
          {:else}
            <small>Freischaltung ab Level {requiredLevel}</small>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</aside>

<style>
  .robot-sidebar {
    min-height: 100%;
    padding: 1.25rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    color: #cbd5e1;
  }

  .robot-sidebar-placeholder {
    display: block;
  }

  .robot-sidebar-divider {
    height: 1px;
    margin: 1.25rem 0;
    background: #475569;
  }

  .robot-sidebar-placeholder {
    padding: 0.8rem 0;
    border-bottom: 1px solid #334155;
  }

  .robot-sidebar-placeholder span,
  .robot-sidebar-placeholder strong {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .robot-sidebar-placeholder span {
    color: #64748b;
    font-size: 0.75rem;
  }

  .robot-sidebar-placeholder strong {
    color: #cbd5e1;
    font-size: 0.85rem;
  }

  .sidebar-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .sidebar-section-title strong {
    color: #facc15;
  }

  .energy-track {
    height: 0.55rem;
    margin-top: 0.6rem;
    overflow: hidden;
    background: #0f172a;
    border-radius: 4px;
  }

  .energy-fill {
    height: 100%;
    background: #eab308;
    transition: width 0.2s ease;
  }

  .xp-track {
    height: 0.45rem;
    margin-top: 0.55rem;
    overflow: hidden;
    background: #0f172a;
    border-radius: 4px;
  }

  .xp-fill {
    height: 100%;
    background: #38bdf8;
    transition: width 0.2s ease;
  }

  .robot-sidebar-placeholder small {
    display: block;
    margin-top: 0.45rem;
    color: #64748b;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .sidebar-upgrade-list {
    display: grid;
    gap: 0.55rem;
    margin-top: 0.7rem;
  }

  .sidebar-upgrade-row {
    padding: 0.55rem 0.65rem;
    background: #172033;
    border: 1px solid #334155;
    border-radius: 6px;
  }

  .sidebar-upgrade-row.upgrade-installed {
    border-color: #0ea5e9;
  }

  .sidebar-upgrade-name {
    display: block;
    color: #cbd5e1;
    font-size: 0.78rem;
  }

  .sidebar-upgrade-row small {
    margin-top: 0.25rem;
    color: #64748b;
  }

  .sidebar-upgrade-row.upgrade-installed small {
    color: #38bdf8;
  }

  .robot-visual {
    padding-bottom: 0.25rem;
    text-align: center;
  }

  .robot-scene {
    position: relative;
    width: 100%;
    height: 220px;
    margin: 0 auto 0.25rem;
    overflow: hidden;
    background: #172554;
    border: 1px solid #1d4ed8;
    border-radius: 8px;
  }

  .robot-platform {
    position: absolute;
    left: 12%;
    right: 12%;
    bottom: 19px;
    height: 10px;
    background: #475569;
    border: 2px solid #64748b;
    border-radius: 50%;
    box-shadow: 0 0 0 5px #1e3a8a;
  }

  .robot-figure {
    position: absolute;
    left: 50%;
    bottom: 33px;
    width: 116px;
    height: 175px;
    transform: translateX(-50%);
    animation: robot-hover 3s ease-in-out infinite;
  }

  .robot-head,
  .robot-body,
  .robot-arm,
  .robot-leg,
  .robot-sensor-bar {
    position: absolute;
    background: #cbd5e1;
    border: 2px solid #64748b;
  }

  .robot-head { left: 27px; top: 12px; width: 62px; height: 48px; border-radius: 10px 10px 7px 7px; background: #e2e8f0; }
  .robot-body { left: 20px; top: 70px; width: 76px; height: 70px; border-radius: 12px 12px 16px 16px; background: #94a3b8; }
  .robot-sensor-bar { left: 37px; top: 2px; width: 42px; height: 12px; border-radius: 6px; background: #475569; z-index: 2; }
  .robot-sensor-bar span { display: inline-block; width: 6px; height: 6px; margin: 1px 4px; border-radius: 50%; background: #64748b; }
  .robot-sensor-bar span.installed { background: #facc15; box-shadow: 0 0 8px #facc15; }
  .robot-eye { position: absolute; top: 17px; width: 12px; height: 7px; border-radius: 4px; background: #0f172a; }
  .robot-eye:first-child { left: 13px; }
  .robot-eye:last-child { right: 13px; }
  .robot-eye.radar-active { background: #22d3ee; box-shadow: 0 0 10px #22d3ee; animation: radar-pulse 1.5s ease-in-out infinite; }
  .robot-core { position: absolute; left: 27px; top: 20px; width: 22px; height: 22px; border: 4px solid #475569; border-radius: 50%; background: #1e293b; }
  .robot-core.core-active { background: #facc15; border-color: #fef08a; box-shadow: 0 0 14px #facc15; }
  .robot-arm { top: 77px; width: 16px; height: 60px; border-radius: 8px; background: #64748b; }
  .robot-arm-left { left: 2px; transform: rotate(8deg); }
  .robot-arm-right { right: 2px; transform: rotate(-8deg); }
  .robot-arm-left.has-diamond-blade::after {
    position: absolute;
    top: 47px;
    left: -8px;
    width: 28px;
    height: 28px;
    content: '';
    border: 4px dashed #e2e8f0;
    border-radius: 50%;
    box-shadow: 0 0 8px #cbd5e1;
    animation: blade-spin 2.4s linear infinite;
  }
  .robot-arm-right.has-cutter { background: #f97316; border-color: #fdba74; box-shadow: 0 0 10px #f97316; }
  .robot-leg { top: 136px; width: 20px; height: 35px; border-radius: 5px; background: #64748b; }
  .robot-leg-left { left: 29px; }
  .robot-leg-right { right: 29px; }
  .robot-low-energy .robot-core { background: #ef4444; border-color: #fca5a5; box-shadow: 0 0 12px #ef4444; }
  .robot-avatar-caption { min-height: 1.5rem; font-size: 1.25rem; }
  .robot-visual h3 { margin: 0; font-size: 1.1rem; }
  .robot-status { margin: 0.2rem 0 0; font-size: 0.8rem; color: #4ade80; }
  .energy-controls { display: grid; gap: 0.45rem; margin-top: 0.7rem; }
  .energy-controls > span { color: #cbd5e1; font-size: 0.78rem; }

  @keyframes robot-hover {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-4px); }
  }

  @keyframes radar-pulse {
    0%, 100% { opacity: 0.65; }
    50% { opacity: 1; }
  }

  @keyframes blade-spin {
    to { transform: rotate(360deg); }
  }
</style>
