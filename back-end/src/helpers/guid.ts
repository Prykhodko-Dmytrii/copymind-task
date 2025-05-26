import { v4 as uuidv4, validate } from "uuid"


export class Guid{
    public static newGuid(){
        return uuidv4();
    }

    public static isValid(guid:string | undefined | null){
        return validate(guid);
    }

    public static isValidAll (...guids: (string | undefined | null)[]){
        return guids.every((guid) => Guid.isValid(guid));
    }
}