-- Create admin_point_tracking_time_windows table for managing time-based point tracking windows
CREATE TABLE admin_point_tracking_time_windows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL
);
