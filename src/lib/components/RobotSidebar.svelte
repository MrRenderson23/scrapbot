<script lang="ts">
  let { playerLevel, experiencePoints, currentLevelXp, nextLevelXp, energy, maxEnergy } = $props<{
    playerLevel: number;
    experiencePoints: number;
    currentLevelXp: number;
    nextLevelXp: number;
    energy: number;
    maxEnergy: number;
  }>();
</script>

<aside class="robot-sidebar" aria-label="Roboterprofil">
  <div class="robot-sidebar-header">
    <span class="robot-sidebar-avatar">🤖</span>
    <div>
      <strong>ScrapBot</strong>
      <span>Roboterprofil</span>
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
    <strong>Freischaltung nach Level</strong>
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

  .robot-sidebar-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .robot-sidebar-avatar {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    background: #0f172a;
    border: 1px solid #475569;
    border-radius: 8px;
    font-size: 1.5rem;
  }

  .robot-sidebar-header strong,
  .robot-sidebar-header span,
  .robot-sidebar-placeholder {
    display: block;
  }

  .robot-sidebar-header strong {
    color: #f8fafc;
    font-size: 0.95rem;
  }

  .robot-sidebar-header span {
    margin-top: 0.15rem;
    color: #64748b;
    font-size: 0.75rem;
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
</style>
