
create or replace view public.v_shelf_availability as
select
    b.id as book_id,
    count(bc.id) as total_copies,
    count(case when l.id is null or l.returned_date is not null then bc.id end) as available_copies,
    min(case when l.id is not null and l.returned_date is null then l.due_date end) as next_available_date
from
    books b
join
    book_copies bc on b.id = bc.book_id
left join
    loans l on bc.id = l.copy_id and l.returned_date is null
group by
    b.id;

create or replace function api.get_shelf_availability(p_search text default null, p_status text default null, p_limit int default 10, p_offset int default 0)
returns table (
    book_id uuid,
    total_copies bigint,
    available_copies bigint,
    next_available_date date,
    title text,
    author text,
    cover_image_url text
)
as $$
begin
    return query
    select
        v.book_id,
        v.total_copies,
        v.available_copies,
        v.next_available_date,
        b.title,
        b.author,
        b.cover_image_url
    from
        public.v_shelf_availability v
    join
        books b on v.book_id = b.id
    where
        (p_search is null or b.title ilike '%' || p_search || '%' or b.author ilike '%' || p_search || '%')
        and (p_status is null or (p_status = 'available' and v.available_copies > 0) or (p_status = 'unavailable' and v.available_copies = 0))
    limit p_limit
    offset p_offset;
end;
$$ language plpgsql;

grant execute on function api.get_shelf_availability to authenticated;

create policy "Allow authenticated users to select" on public.v_shelf_availability
for select
to authenticated
using (auth.role() = 'authenticated');

