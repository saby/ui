import EmployeeCard from './EmployeeCard';
import { getData } from './DataController';
import 'css!UIDemo/Adaptive/EmployeeDashboard/EmployeeDashboard';
import { AdaptiveContainer, useAdaptiveMode } from 'UI/Adaptive';

const MIN_COLUMN_WIDTH = 250;

export default function Dashboard(props) {
    const employees = getData();
    const adaptiveMode = useAdaptiveMode();

    const possibleColumnsCount =
        Math.floor(adaptiveMode.container.clientWidth.value / MIN_COLUMN_WIDTH) || 1;
    const desirableColumnsCount = props.columnsCount || 1;
    const columnsCount = Math.min(possibleColumnsCount, desirableColumnsCount);
    const columnWidth = Math.round(adaptiveMode.container.clientWidth.value / columnsCount);

    const employeesGrouped = [];
    for (let i = 0; i < employees.length; i++) {
        const columnIndex = i % columnsCount;
        employeesGrouped[columnIndex] = employeesGrouped[columnIndex] || [];
        employeesGrouped[columnIndex].push(employees[i]);
    }

    return (
        <div className={'tw-flex'}>
            {employeesGrouped.map((employees, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className={'tw-flex-1 tw-@container'}>
                    {employees.map((employee) => (
                        <AdaptiveContainer key={employee.id} width={columnWidth}>
                            <EmployeeCard employee={employee} />
                        </AdaptiveContainer>
                    ))}
                </div>
            ))}
        </div>
    );
}
