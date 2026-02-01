ALTER TABLE blocks
ADD CONSTRAINT unique_block_position
UNIQUE (workspace_id, position);
