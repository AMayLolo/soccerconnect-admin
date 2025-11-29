"use client";

import { toast } from "react-hot-toast";

type NotifyOptions = {
	id?: string;
	duration?: number;
};

export function useNotify() {
	const success = (message: string, opts: NotifyOptions = {}) =>
		toast.success(message, { id: opts.id, duration: opts.duration ?? 3000 });
	const error = (message: string, opts: NotifyOptions = {}) =>
		toast.error(message, { id: opts.id, duration: opts.duration ?? 4000 });
	const info = (message: string, opts: NotifyOptions = {}) =>
		toast(message, { id: opts.id, duration: opts.duration ?? 3000 });

	return { success, error, info };
}

export type UseNotify = ReturnType<typeof useNotify>;
