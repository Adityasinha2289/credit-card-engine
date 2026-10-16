-- Create Planning Sessions table
CREATE TABLE IF NOT EXISTS public.planning_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    current_phase INTEGER NOT NULL DEFAULT 1,
    schema_version INTEGER NOT NULL DEFAULT 1,
    revision INTEGER NOT NULL DEFAULT 1,
    draft JSONB NOT NULL DEFAULT '{}'::jsonb,
    selected_plan JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for fast lookup by user and plan_type
CREATE INDEX IF NOT EXISTS idx_planning_sessions_user_id ON public.planning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_sessions_plan_type ON public.planning_sessions(plan_type);

-- Enable RLS
ALTER TABLE public.planning_sessions ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own planning sessions" 
ON public.planning_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planning sessions" 
ON public.planning_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning sessions" 
ON public.planning_sessions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning sessions" 
ON public.planning_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Create an update trigger to auto-bump updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planning_sessions_updated_at
BEFORE UPDATE ON public.planning_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Add a helper RPC for atomic saves (optimistic concurrency)
CREATE OR REPLACE FUNCTION public.save_planning_session_v1(
    p_id UUID,
    p_user_id UUID,
    p_plan_type TEXT,
    p_status TEXT,
    p_current_phase INTEGER,
    p_draft JSONB,
    p_selected_plan JSONB,
    p_expected_revision INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_current_revision INTEGER;
    v_updated_row JSONB;
BEGIN
    -- Verify the session exists
    SELECT revision INTO v_current_revision
    FROM public.planning_sessions
    WHERE id = p_id AND user_id = p_user_id;

    IF FOUND THEN
        -- Check optimistic concurrency
        IF v_current_revision > p_expected_revision THEN
            RAISE EXCEPTION 'STALE_SAVE: Current revision % is newer than expected %', v_current_revision, p_expected_revision;
        END IF;

        -- Update existing
        UPDATE public.planning_sessions
        SET 
            plan_type = COALESCE(p_plan_type, plan_type),
            status = COALESCE(p_status, status),
            current_phase = COALESCE(p_current_phase, current_phase),
            draft = COALESCE(p_draft, draft),
            selected_plan = COALESCE(p_selected_plan, selected_plan),
            revision = revision + 1,
            last_viewed_at = now()
        WHERE id = p_id AND user_id = p_user_id
        RETURNING to_jsonb(public.planning_sessions.*) INTO v_updated_row;
    ELSE
        -- Insert new
        INSERT INTO public.planning_sessions (
            id, user_id, plan_type, status, current_phase, draft, selected_plan, revision
        ) VALUES (
            p_id, p_user_id, p_plan_type, p_status, p_current_phase, p_draft, p_selected_plan, 1
        )
        RETURNING to_jsonb(public.planning_sessions.*) INTO v_updated_row;
    END IF;

    RETURN v_updated_row;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
