CREATE TABLE admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  current_year INTEGER NOT NULL,
  current_week INTEGER,
  admin_email VARCHAR(255) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  active_league_median_scraping BOOLEAN NOT NULL DEFAULT FALSE,
  active_points_graph_scraping BOOLEAN NOT NULL DEFAULT FALSE
);
