ALTER TABLE workspaces
ADD CONSTRAINT unique_workspace_per_owner UNIQUE (name, owner_id);