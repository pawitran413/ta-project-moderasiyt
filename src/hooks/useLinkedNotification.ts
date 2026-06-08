"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UseLinkedNotificationReturn {
	linkedSuccess: string;
}

export const useLinkedNotification = (): UseLinkedNotificationReturn => {
	const searchParams = useSearchParams();
	const hasHandled = useRef(false);
	const [linkedSuccess, setLinkedSuccess] = useState("");

	useEffect(() => {
		if (searchParams.get("linked") === "1" && !hasHandled.current) {
			hasHandled.current = true;
			setLinkedSuccess("Channel YouTube berhasil ditautkan");
			window.history.replaceState({}, "", "/dashboard");
		}
	}, [searchParams]);

	return { linkedSuccess };
};
