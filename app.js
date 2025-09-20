
// FoodBridge demo (no backend): stores data in localStorage and simulates matching/notifications.
const LS_KEY = "foodbridge_items_v1";

function uid()
{ 
  return Math.random().toString(36).slice(2,10); 
}

function getItems()
{
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveItems(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function geolocate(cb)
{
  if(!navigator.geolocation){ cb(null); return; }
  navigator.geolocation.getCurrentPosition(
    pos=>cb({lat:pos.coords.latitude, lng:pos.coords.longitude}), 
    _=>cb(null),
    {enableHighAccuracy:true, timeout:6000}
  );
}

// Haversine distance in km
function distanceKm(a,b)
{
  if(!a || !b) return null;
  const R = 6371;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLng = (b.lng-a.lng)*Math.PI/180;
  const s1 = Math.sin(dLat/2)**2;
  const s2 = Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1+s2));
}

function showToast(msg)
{
  const el = document.querySelector(".toast"); 
  if(!el) return;
  el.textContent = msg; el.style.display="block";
  setTimeout(()=>el.style.display="none", 2800);
}

// Create a donor listing
function createListing(data)
{
  const items = getItems();
  data.id = uid();
  data.status = "open"; // 'open' | 'claimed'
  data.createdAt = Date.now();
  items.push(data);
  saveItems(items);
  // "Notify" nearby receivers (simulated)
  showToast("New food listed! Nearby receivers notified.");
  return data.id;
}

function claimListing(id, receiver)
{
  const items = getItems().map(x=>
  {
    if(x.id===id && x.status==="open")
    {
      x.status="claimed";
      x.claimedBy=receiver;
      x.claimedAt=Date.now();
    }
    return x;
  });
  saveItems(items);
  showToast("Listing claimed. Donor has been notified!");
}

function fmtTime(ms)
{
  const d = new Date(ms);
  return d.toLocaleString();
}

function seedIfEmpty()
{
  const items = getItems();
  if(items.length) return;
  const sample = [
    { donor:"Sathyabama Hostel - A Block", phone:"9876543210", type:"Veg meals", qty:"25 portions", note:"Packed before 1:30 PM", lat:12.872, lng:80.221 },
    { donor:"Ocean View Restaurant", phone:"9003100310", type:"Chicken biryani", qty:"15 plates", note:"No onions", lat:12.906, lng:80.250 },
    { donor:"Wedding Hall - Pallikaranai", phone:"9962554410", type:"Curd rice", qty:"40 bowls", note:"Pick up by 9 PM", lat:12.949, lng:80.205 }
  ];
  sample.forEach(s=>createListing(s));
}
