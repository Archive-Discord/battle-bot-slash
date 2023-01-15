import { Model, Schema, model } from 'mongoose';

interface AttendanceDB {
  user_id: string;
  date: Date;
}

const AttendanceSchema: Schema<AttendanceDB> = new Schema({
  date: Date,
  user_id: String,
});

const Attendance: Model<AttendanceDB> = model('attendance', AttendanceSchema, 'attendance');

export default Attendance;
