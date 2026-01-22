import multer from "multer";

const Storage=multer.diskStorage({})

export const upload=multer({Storage})

