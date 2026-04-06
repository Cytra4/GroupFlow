import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { supabase } from "./client";

type FetchOptions = {
	select?: string;
	limit?: number;
	filter?: Record<string, string | number | undefined | string[]>;
	order?: { column: string; ascending?: boolean }[];
	search?: { column: string; value: string | number };
};

export function useFetch<T>(
	table: string,
	options: FetchOptions = { select: "*" }
) {
	return useQuery<T[], Error>({
		queryKey: ["fetch", table, options],
		queryFn: async () => {
			let query = supabase.from(table).select(options.select);

			if (options.filter) {
				for (const [key, value] of Object.entries(options.filter)) {
					if (Array.isArray(value)){
						query = query.in(key, value);
					}
					else{
						query = query.eq(key, value);
					}
				}
			}

			if (options.search) {
				const { column, value } = options.search;
				if (typeof value === "number") {
					query = query.eq(column, value);
				} else {
					query = query.ilike(column, `%${value}%`);
				}
			}

			if (options.limit) query = query.limit(options.limit);

			if (options.order) {
				options.order.forEach((o) => {
					query = query.order(o.column, { ascending: o.ascending ?? true });
				});
			}

			const { data, error } = await query;
			if (error) throw error;

			return (data ?? []) as T[];
		},
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

export function useFetchBuilder<T>(
	queryBuilder: () => any,
	deps: any[] = []
) {
	return useQuery<T[], Error>({
		queryKey: ["fetchBuilder", ...deps],
		queryFn: async () => {
			const query = queryBuilder();
			const { data, error } = await query;
			if (error) throw error;
			return (data ?? []) as T[];
		},
	});
}

export function useInsert<T>() {
	return useMutation({
		mutationFn: async ({ table, row }: {
			table: string;
			row: Record<string, any>;
		}) => {
			const { data, error } = await supabase.from(table).insert(row).select();
			if (error) throw error;
			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ["fetch", table] });
		},
	});
}

export function useUpdate<T>() {
	return useMutation({
		mutationFn: async ({ table, column, value, newRow }: {
			table: string;
			column: string;
			value: string | number;
			newRow: Record<string, any>;
		}) => {
			const { data, error } = await supabase
				.from(table)
				.update(newRow)
				.eq(column, value)
				.select();
			if (error) throw error;
			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ["fetch", table] });
		},
	});
}

export function useDelete<T>() {
	return useMutation({
		mutationFn: async ({ table, column, value }: {
			table: string;
			column: string;
			value: string | number;
		}) => {
			const { data, error } = await supabase
				.from(table)
				.delete()
				.eq(column, value)
				.select();
			if (error) throw error;
			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ["fetch", table] });
		},
	});
}
