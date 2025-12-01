-- Create a table to store user API keys
create table user_api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null unique,
  gemini_api_key text,
  raphael_ai_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_api_keys enable row level security;

-- Create policies
create policy "Users can view their own keys"
  on user_api_keys for select
  using (auth.uid() = user_id);

create policy "Users can insert their own keys"
  on user_api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own keys"
  on user_api_keys for update
  using (auth.uid() = user_id);

-- Create a function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update updated_at
create trigger on_user_api_keys_updated
  before update on user_api_keys
  for each row execute procedure handle_updated_at();
