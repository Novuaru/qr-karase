'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Listbox, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckIcon, ChevronUpDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const supabase = createClient();

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
  restaurant_id: string;
  image_url: string | null;
};

type CartItem = MenuItem & { quantity: number };

export default function RestaurantMenuPage() {
  const params = useParams();
  const restaurant_id = params.restaurant_id as string;
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [tableNumber, setTableNumber] = useState<string>('');

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .eq('is_available', true);

      if (error) console.error(error);
      else setMenuItems(data || []);
      setLoading(false);
    };
    fetchMenu();
  }, [restaurant_id]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedRestaurantId = localStorage.getItem('restaurant_id');
    const storedTable = localStorage.getItem('table_number');

    if (storedCart && storedRestaurantId === restaurant_id) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem('cart');
        localStorage.removeItem('restaurant_id');
      }
    }

    if (storedTable) setTableNumber(storedTable);
  }, [restaurant_id]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (Object.keys(cart).length > 0)
      localStorage.setItem('restaurant_id', restaurant_id);
    else localStorage.removeItem('restaurant_id');
  }, [cart, restaurant_id]);

  useEffect(() => {
    if (tableNumber) localStorage.setItem('table_number', tableNumber);
    else localStorage.removeItem('table_number');
  }, [tableNumber]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] || { ...item, quantity: 0 };
      return {
        ...prev,
        [item.id]: { ...current, quantity: current.quantity + 1 },
      };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      if (item.quantity === 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [id]: { ...item, quantity: item.quantity - 1 },
        };
      }
    });
  }, []);

  const getQuantity = (id: string) => cart[id]?.quantity || 0;

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const goToCart = () => {
    if (!tableNumber) {
      toast.error('Silakan pilih nomor meja terlebih dahulu.');
      return;
    }
    router.push(`/cart?restaurant_id=${restaurant_id}&table_number=${tableNumber}`);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ['Semua', ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Semua') return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const MenuCard = ({ item }: { item: MenuItem }) => {
    const quantity = getQuantity(item.id);
    return (
      <div className="border rounded-xl shadow hover:shadow-lg transition bg-white flex flex-col overflow-hidden">
        <div className="h-48 bg-gray-50 flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={(e) => (e.currentTarget.src = '/no-image.png')}
              className="h-full object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">Tidak ada gambar</span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h2 className="font-bold text-lg mb-1">{item.name}</h2>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-red-600 font-semibold mt-2 mb-4">
            Rp{item.price.toLocaleString('id-ID')}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <button
              onClick={() => removeFromCart(item.id)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={quantity === 0}
            >
              -
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-700">🍽️ Daftar Menu</h1>

        <Listbox value={tableNumber} onChange={setTableNumber}>
          <div className="relative">
            <Listbox.Button className="relative w-40 cursor-default rounded border bg-white py-1.5 pl-3 pr-10 text-left shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-red-500">
              <span className="block truncate">
                {tableNumber ? `Meja ${tableNumber}` : 'Pilih Meja'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                {[...Array(15)].map((_, i) => {
                  const value = String(i + 1);
                  return (
                    <Listbox.Option
                      key={value}
                      value={value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-red-100 text-red-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : ''}`}>
                            Meja {value}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                              <CheckIcon className="h-4 w-4" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      <div className="overflow-x-auto whitespace-nowrap no-scrollbar mb-6">
        <div className="inline-flex gap-2 px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm border transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white font-semibold shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 gap-2 text-gray-600">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-red-600" />
          <span>Memuat menu...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-400">Menu tidak ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={goToCart}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 shadow disabled:opacity-50"
              disabled={totalItems === 0}
            >
              🛒 Lihat Keranjang ({totalItems} item)
            </button>
          </div>
        </>
      )}
    </main>
  );
}
