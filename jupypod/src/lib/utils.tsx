import { customAlphabet } from "nanoid";
import { lowercase, numbers } from "nanoid-dictionary";

export const myNanoId = customAlphabet(lowercase + numbers, 20);