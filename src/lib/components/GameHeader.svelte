<script lang="ts">
  import packageJson from '../../../package.json';

  let {
    robotAvatar,
    credits,
    activeTab,
    isAdmin,
    onTabChange
  } = $props<{
    robotAvatar: string;
    credits: number;
    activeTab: string;
    isAdmin: boolean;
    onTabChange: (tab: string) => void;
  }>();

  const tabs = [
    ['basis', '🏰 Basis'],
    ['lager', '📦 Lager'],
    ['markt', '💰 Markt'],
    ['schrott', '🔍 Schrottplatz'],
    ['zerlegen', '⚙️ Werkbank'],
    ['upgrades', '🤖 Upgrades'],
    ['quests', '📜 Aufträge'],
    ['stats', '📊 Statistik']
  ];

  const gameVersion = packageJson.version;
</script>

<header class="game-header">
  <div class="header-main">
    <h1>
      <span class="robot-avatar">{robotAvatar}</span>
      <span>ScrapBot HQ</span>
      <span class="version-badge">v{gameVersion}</span>
    </h1>
    <div class="stats-row">
      <div class="credits-box">
        <span>💰 Credits: {credits}</span>
      </div>
    </div>
  </div>

  <nav class="tabs-nav">
    {#each tabs as [tab, label]}
      <button class:active={activeTab === tab} onclick={() => onTabChange(tab)}>{label}</button>
    {/each}
    {#if isAdmin}
      <button class:active={activeTab === 'dev'} onclick={() => onTabChange('dev')}>🛠️ Dev-Panel</button>
    {/if}
  </nav>
</header>

<style>
  .game-header {
    background: #1e293b;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border: 1px solid #334155;
  }

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-main h1 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .version-badge {
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    background: #0f172a;
    border: 1px solid #334155;
    padding: 0.25rem 0.45rem;
    border-radius: 999px;
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .credits-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #0f172a;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #334155;
  }

  .tabs-nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tabs-nav button {
    background: #334155;
    color: #cbd5e1;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }

  .tabs-nav button.active {
    background: #2563eb;
    color: white;
  }
</style>
