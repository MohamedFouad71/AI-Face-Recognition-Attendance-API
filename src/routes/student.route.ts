import { Router } from 'express';

import StudentController from '#controllers/student.controller..js';

const studentRouter = Router();
const studentController = new StudentController();

studentRouter.post('/', studentController.create);
studentRouter.get('/', studentController.getAll);
studentRouter.get('/:id', studentController.getById);
studentRouter.patch('/:id', studentController.update);
studentRouter.delete('/:id', studentController.delete);

export default studentRouter;
