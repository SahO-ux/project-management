import { toast } from "react-hot-toast";

export const successToast = (msg) => toast.success(msg, { duration: 3000 });
export const errorToast = (msg) => toast.error(msg, { duration: 5000 });
export const infoToast = (msg) => toast(msg, { duration: 3000 });
