import { useEffect, useState } from 'react';

const service1Url =
  import.meta.env.VITE_SERVICE_1_URL_DEV || 'http://localhost:3000';

type Order = {
  id: number;
  item: string;
  quantity: number;
  user_id: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  orders?: Order[];
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

const getUserOrders = async (userId: number): Promise<Order[]> => {
  const response = await fetch(`${service1Url}/svc-2/users/${userId}/orders`);
  const res = await response.json();
  console.log('data.orders:::>>>', res);
  return res.data.orders;
};

console.log('service1Url', service1Url);
function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isHealthy, setIsHealthy] = useState(false);

  const fetchUsers = async () => {
    const users = await getUsers();

    const promises = users.map(async (user: User) => {
      const orders = await getUserOrders(user.id);
      user.orders = orders;
      return user;
    });

    const updatedUsers = await Promise.all(promises);

    console.log('users', updatedUsers);
    setUsers(updatedUsers);
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
                    {user.orders && user.orders.length > 0 ? (
                      <ul className='mt-2 ml-4 list-disc'>
                        {user.orders.map((order: Order) => (
                          <li key={order.id}>
                            {order.item} (Quantity: {order.quantity})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-sm text-gray-500'>No orders found.</p>
                    )}
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
