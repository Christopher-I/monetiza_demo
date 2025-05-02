import { useState, useEffect } from 'react';
import withProtectedRoute from "../hoc/ProtectedRoute";
import Loading from "../components/Loading";
import cardImg from "../imgs/cards.png";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CardItem from '../components/CardItem';

const Cards = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMethodIdToDelete, setPaymentMethodIdToDelete] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editedExpMonth, setEditedExpMonth] = useState("");
  const [editedExpYear, setEditedExpYear] = useState("");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/saveCard/view/saveCard`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setCards(response.data.savedCards);
        } else {
          toast.error('Failed to fetch saved cards');
        }
      } catch (error) {
        toast.error(`Error fetching cards: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [baseUrl]);

  const deleteCard = async (paymentMethodId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/saveCard/deleteCard`,
        { paymentMethodId },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Card deleted successfully');
        setCards((prevCards) =>
          prevCards.filter((card) => card.paymentMethodId !== paymentMethodId)
        );
      } else {
        toast.error(`Failed to delete card: ${response.data.message}`);
      }
    } catch (error) {
      toast.error(`Error deleting card: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/saveCard/defaultCard`,
        { paymentMethodId: id },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Card set as default successfully");
        setCards((prevCards) =>
          prevCards.map((card) => ({
            ...card,
            isDefault: card.paymentMethodId === id,
          }))
        );
      } else {
        toast.error(response.data.message || "Failed to set default card");
      }
    } catch (error) {
      toast.error(`Error setting default card: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRemoveCard = (paymentMethodId) => {
    setPaymentMethodIdToDelete(paymentMethodId);
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (paymentMethodIdToDelete) deleteCard(paymentMethodIdToDelete);
    setModalVisible(false);
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setEditedExpMonth(card.exp_month);
    setEditedExpYear(card.exp_year);
  };

  const handleSubmitEditCard = async (event) => {
    event.preventDefault();
    const updatedCardDetails = { exp_month: editedExpMonth, exp_year: editedExpYear };
    try {
      const response = await axios.post(
        `${baseUrl}/api/saveCard/editCard`,
        { paymentMethodId: editingCard.paymentMethodId, updatedCardDetails },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Card updated successfully');
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.paymentMethodId === editingCard.paymentMethodId
              ? { ...card, exp_month: editedExpMonth, exp_year: editedExpYear }
              : card
          )
        );
      } else {
        toast.error('Failed to update card');
      }
    } catch (error) {
      toast.error(`Error updating card: ${error.message}`);
    } finally {
      setEditingCard(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full min-h-screen bg-[var(--bg-color)] py-10 px-6 flex justify-center">
      <div className="w-full max-w-[800px] bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Manage Cards</h2>
          <img loading="lazy" src={cardImg} className="w-8 h-8 ml-4" alt="Card" />
        </div>

        <h3 className="text-lg font-medium text-gray-600">Choose your payment method</h3>

        <div className="space-y-4">
          {cards.map((card) => (
            <CardItem
              key={card.paymentMethodId}
              card={card}
              onRemove={handleRemoveCard}
              onEdit={handleEditCard}
              onSetDefault={handleSetDefault}
            />
          ))}

          <Link
            to="/add-card"
            className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-4 transition-colors"
          >
            <img src={cardImg} alt="Add card" className="w-6 h-6 mr-2" />
            <span className="text-gray-700 font-medium">Add Payment Method</span>
          </Link>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <p className="text-base font-semibold text-gray-700">Are you sure you want to delete this card?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
              <button onClick={handleCancelDelete} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editingCard && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Edit Card</h3>
            <form onSubmit={handleSubmitEditCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Month</label>
                <input
                  type="number"
                  value={editedExpMonth}
                  onChange={(e) => setEditedExpMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Year</label>
                <input
                  type="number"
                  value={editedExpYear}
                  onChange={(e) => setEditedExpYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Save</button>
                <button type="button" onClick={() => setEditingCard(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default withProtectedRoute(Cards, 'cards');
