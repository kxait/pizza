- [x] kierownik
  - [x] rewizja stanu magazynowego półproduktów
  - [x] OPTIONAL wprowadzenie zapotrzebowania na produkty do systemu
- [x] klient
  - [x] przegladanie oferty produktow pizzerii w wybranym lokalu
  - [x] zlozenie zamowienia z roznymi opcjami platnosci (portfele internetowe, BLIK, przelewy blyskawiczne, platnosc przy odbiorze karta/gotowka)
  - [x] podglad aktualnego stanu zlozonego zamowienia (razem z informacja GPS o lokalizacji dostawcy w trakcie dowozu (NA SWIRZO XD))
  - [x] OPTIONAL wglad w informacje o firmie, godzinach otwarcia poszczegolnych lokali, danych kontaktowym i adresowych etc
  - [x] zamowienie ma sciagac itemy z inventory
- [x] dostawca
  - [x] wglad w liste zamowien do dostarczenia
  - [x] wglad w szczegoly indywidualnego zamowienia
  - [x] zarzadzanie statusem zamowien
- [x] kucharz
  - [x] wglad w liste zamowien do realizacji
  - [x] wglad w szczegoly indywidualnego zamowienia
  - [x] zarzadzanie statusem zamowien
- [x] oprogramowanie
  - [x] automatycznie aktualizowanie danych o stanie magazynowym na podstawie zrealizowanych zamowien

home - informacje o restauracji
products/ - katalog pizzy z buttonami "zamow"
products/order - wizard do zamowienia

intra - menu pracownika
intra/login - zalogowanie
intra/orders - lista zamowien z statusami
intra/orders/$orderId - konkret zamowienie
intra/inventory - magazyn

schema

user
int id
text role (CLIENT, COOK, MANAGER, DELIVERY)
text password_hash
text email
text phone_number

product
int id
text name
text description
real price

product_inventory
int product_id
int inventory_id
real inventory_qty_required

order
int id
int user_id
text address
text made_date_time
text est_arrival_date_time
text status (NEW, CONFIRMED, IN_PROGRESS, DELIVERY, DELIVERED, ERROR)
text payment_type (CARD, BLIK, CASH)
text payment_status (PENDING, FINISHED)

order_product
int order_id
int product_id
int qty

inventory
int id
text name
real qty
text unit
