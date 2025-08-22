alter table nfl_players_2025
  add column fp_adp_std_avg numeric,
  add column fp_adp_ppr_avg numeric,
  add column fp_adp_half_ppr_avg numeric, -- fantasy pros average draft position half ppr
  add column whats_new text,
  add column bye_week integer,
  add column is_rookie boolean