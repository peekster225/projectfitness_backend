
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";

class UserController {

	static info = async (req: Request, res: Response) => {
        let user: User;
        const userRepository = getRepository(User);
        const id: string = res.locals.jwtPayload.userId;

        try {
            user = await userRepository.findOne(id,
                {select: ['username', 'role', 'dateOfBirth', 'weightInLBS', 'heightInInches']})
        }
        catch(e) {
            console.error(e);
            return;
        }

        if(user)
            res.status(200).send(user)
    };
    
}


export default UserController;