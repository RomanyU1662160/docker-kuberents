import { useEffect, useState } from 'react';

const service1Url =
  import.meta.env.VITE_SERVICE_1_URL_DEV || 'http://localhost:3000';

type User = {
  id: number;
  name: string;
  email: string;
};

const getHealth = async () => {
  const response = await fetch(`${service1Url}/health`);
  const data = await response.json();
  console.log('data:::>>>', data);
  return data;
};

const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${service1Url}/users`);
  const data = await response.json();
  return data.users;
};
console.log('service1Url', service1Url);
function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isHealthy, setIsHealthy] = useState(false);

  const fetchUsers = async () => {
    const users = await getUsers();
    console.log('users', users);
    setUsers(users);
  };

  const fetchHealth = async () => {
    const health = await getHealth();
    console.log('health', health);
    setIsHealthy(health.status === 'OK');
  };

  useEffect(() => {
    fetchUsers();
    fetchHealth();
  }, []);

  return (
    <>
      <div className='text-end p-4 bg-slate-200 font-mono'>
        {' '}
        Service health check:{' '}
        <span>
          {isHealthy ? (
            <span className='text-green-600 font-bold animate-pulse'>
              Healthy
            </span>
          ) : (
            <span className='text-red-600 font-bold animate-pulse'>
              Unhealthy
            </span>
          )}
        </span>
      </div>
      <div className='container bg-slate-100 h-screen flex items-center justify-center flex-col gap-4'>
        <div>
          {users.length === 0 ? (
            <div>Loading...</div>
          ) : (
            <div className='bg-white p-6 rounded shadow-md'>
              <h1 className='text-2xl text-center text-red-900 font-bold mb-4'>
                Users
              </h1>
              <ul>
                {users.map((user: User) => (
                  <li key={user.id} className='mb-2 w-full border-b pb-2'>
                    <span className='font-semibold'>{user.name}</span> -{' '}
                    <span className='text-gray-600'>{user.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
