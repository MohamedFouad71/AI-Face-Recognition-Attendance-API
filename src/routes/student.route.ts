import { Router } from 'express';

import StudentController from '#controllers/student.controller..js';

const studentRouter = Router();
const studentController = new StudentController();

studentRouter.post('/', studentController.create);

export default studentRouter;
