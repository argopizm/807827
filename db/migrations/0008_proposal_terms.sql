-- Existing offers retain NULL terms; do not invent a price or delivery promise.
ALTER TABLE handshakes ADD COLUMN proposal_message TEXT CHECK (proposal_message IS NULL OR length(proposal_message) BETWEEN 20 AND 4000);
ALTER TABLE handshakes ADD COLUMN amount_kurus INTEGER CHECK (amount_kurus IS NULL OR (typeof(amount_kurus) = 'integer' AND amount_kurus BETWEEN 1 AND 1000000000));
ALTER TABLE handshakes ADD COLUMN delivery_days INTEGER CHECK (delivery_days IS NULL OR (typeof(delivery_days) = 'integer' AND delivery_days BETWEEN 1 AND 365));
