import { SharedData } from './index';
import { Password } from './passwords';

export interface DashboardPageProps extends SharedData {
    recentPasswords: Password[];
}
