# 💻 Code Examples & Implementation Details

## 1. Hospital Phone Number Generation

### Function Code
```javascript
function generateRandomPhone(areaCode) {
  const firstDigit = Math.floor(Math.random() * 8) + 2; // 2-9
  const remaining = Array.from({length: 8}, () => Math.floor(Math.random() * 10)).join('');
  return `+91-${areaCode}-${firstDigit}${remaining}`;
}
```

### How It Works
```
Input: areaCode = "84" (for Kakinada)

Step 1: Generate first digit (2-9)
  Math.random() = 0.543
  * 8 = 4.344
  + 2 = 6.344
  Math.floor() = 6

Step 2: Generate remaining 8 digits
  Loop 8 times, get random 0-9
  Example: [2, 4, 5, 6, 7, 8, 9, 0]
  Join: "24567890"

Step 3: Format
  "+91-" + "84" + "-" + "6" + "24567890"
  = "+91-84-624567890"
```

### Example Outputs
```
generateRandomPhone("80")  → "+91-80-34567890"
generateRandomPhone("22")  → "+91-22-56789012"
generateRandomPhone("84")  → "+91-84-78901234"
generateRandomPhone("83")  → "+91-83-89012345"
```

---

## 2. Hospital Name Generation

### Function Code
```javascript
function generateRandomHospitalName() {
  const prefix = hospitalNamePrefixes[Math.floor(Math.random() * hospitalNamePrefixes.length)];
  const suffix = hospitalNameSuffixes[Math.floor(Math.random() * hospitalNameSuffixes.length)];
  return `${prefix} ${suffix}`;
}
```

### How It Works
```
Prefix Array (30 items):
  [0] = "Apollo"
  [1] = "Fortis"
  ...
  [29] = "Bright"

Suffix Array (12 items):
  [0] = "Hospital"
  [1] = "Clinic"
  ...
  [11] = "Wellness Center"

Step 1: Pick random prefix
  Math.random() = 0.234
  * 30 = 7.02
  Math.floor() = 7
  prefix = "Care"

Step 2: Pick random suffix
  Math.random() = 0.867
  * 12 = 10.404
  Math.floor() = 10
  suffix = "Medical Services"

Step 3: Combine
  "Care" + " " + "Medical Services"
  = "Care Medical Services"
```

### Example Outputs
```
generateRandomHospitalName() → "Apollo Hospital"
generateRandomHospitalName() → "Healing Medical Center"
generateRandomHospitalName() → "Victory Clinic"
generateRandomHospitalName() → "Divine Care Center"
generateRandomHospitalName() → "Fortis Nursing Home"
```

---

## 3. Hospital Rating Generation

### Function Code
```javascript
function generateRandomRating() {
  return (3.5 + Math.random() * 1.3).toFixed(1);
}
```

### How It Works
```
Minimum: 3.5
Maximum: 3.5 + 1.3 = 4.8

Math.random() returns: 0.0 to 0.999999

Examples:
  Math.random() = 0.0   → 3.5 + (0.0 * 1.3) = 3.5
  Math.random() = 0.5   → 3.5 + (0.5 * 1.3) = 4.15 → "4.2"
  Math.random() = 1.0   → 3.5 + (1.0 * 1.3) = 4.8
```

### Example Outputs
```
generateRandomRating() → "3.7"
generateRandomRating() → "4.1"
generateRandomRating() → "4.5"
generateRandomRating() → "3.9"
generateRandomRating() → "4.3"
```

---

## 4. Location-Based Hospital Generation

### Function Code
```javascript
function generateHospitalsForLocation(location) {
  const locData = cityLocations[location.toLowerCase()];
  if (!locData) return generateDefaultHospitals();
  
  const count = locData.count;
  const hospitals = [];
  const usedNames = new Set();
  
  for (let i = 0; i < count; i++) {
    let name;
    do {
      name = generateRandomHospitalName();
    } while (usedNames.has(name));
    usedNames.add(name);
    
    hospitals.push({
      name: name,
      address: `${locData.region}, India`,
      rating: generateRandomRating(),
      phone: generateRandomPhone(locData.code),
      speciality: specialities[Math.floor(Math.random() * specialities.length)]
    });
  }
  
  return hospitals;
}
```

### How It Works - Step by Step

**Input**: `generateHospitalsForLocation("kakinada")`

```
Step 1: Look up location
  location = "kakinada"
  locData = cityLocations["kakinada"]
  = { count: 5, code: "84", region: "Kakinada" }

Step 2: Initialize
  count = 5 (need to generate 5 hospitals)
  hospitals = [] (empty array)
  usedNames = new Set() (track unique names)

Step 3: Loop 5 times (i: 0-4)

  ─── Iteration 1 ───
  Generate name: "Victory Medical Center"
  Check if used: No (first time)
  Add to Set: usedNames = {"Victory Medical Center"}
  Generate rating: "4.3"
  Generate phone: "+91-84-24567890"
  Pick speciality: "Cardiology"
  
  Hospital 1: {
    name: "Victory Medical Center",
    address: "Kakinada, India",
    rating: "4.3",
    phone: "+91-84-24567890",
    speciality: "Cardiology"
  }

  ─── Iteration 2 ───
  Generate name: "Victory Medical Center"
  Check if used: Yes! (already exists)
  Generate NEW name: "Healing Hospital"
  Check if used: No
  Add to Set: usedNames = {"Victory Medical Center", "Healing Hospital"}
  Generate rating: "3.8"
  Generate phone: "+91-84-34567890"
  Pick speciality: "Orthopedics"
  
  Hospital 2: {
    name: "Healing Hospital",
    address: "Kakinada, India",
    rating: "3.8",
    phone: "+91-84-34567890",
    speciality: "Orthopedics"
  }

  [... repeat for iterations 3, 4, 5 ...]

Step 4: Return array
  hospitals = [
    { Hospital 1 object },
    { Hospital 2 object },
    { Hospital 3 object },
    { Hospital 4 object },
    { Hospital 5 object }
  ]
```

### Example Output for "Kakinada"
```javascript
[
  {
    name: "Victory Medical Center",
    address: "Kakinada, India",
    rating: "4.3",
    phone: "+91-84-24567890",
    speciality: "Cardiology"
  },
  {
    name: "Healing Hospital",
    address: "Kakinada, India",
    rating: "3.8",
    phone: "+91-84-34567890",
    speciality: "Orthopedics"
  },
  {
    name: "Divine Care Center",
    address: "Kakinada, India",
    rating: "4.1",
    phone: "+91-84-45678901",
    speciality: "Pediatrics"
  },
  {
    name: "Max Wellness Center",
    address: "Kakinada, India",
    rating: "3.9",
    phone: "+91-84-56789012",
    speciality: "General Practice"
  },
  {
    name: "Fortis Nursing Home",
    address: "Kakinada, India",
    rating: "4.2",
    phone: "+91-84-67890123",
    speciality: "Emergency Care"
  }
]
```

---

## 5. Severity Button Selection

### Function Code
```javascript
function setSeverityScreen(severity) {
  state.severity = severity;
  userSelectedSeverity = severity;
  console.log('Severity set to:', severity);
  
  // Visual feedback - highlight selected button
  document.querySelectorAll('button[id^="severity-"]').forEach(btn => {
    btn.style.borderColor = 'var(--gray-light)';
    btn.style.background = 'white';
    btn.style.color = 'var(--primary-dark)';
  });
  
  // Highlight the selected severity button
  const selectedBtn = document.getElementById(`severity-${severity}`);
  if (selectedBtn) {
    selectedBtn.style.borderColor = severity === 'high' ? '#e74c3c' : (severity === 'medium' ? '#f39c12' : '#27ae60');
    selectedBtn.style.background = severity === 'high' ? 'rgba(231, 76, 60, 0.1)' : (severity === 'medium' ? 'rgba(243, 156, 18, 0.1)' : 'rgba(39, 174, 96, 0.1)');
    selectedBtn.style.color = severity === 'high' ? '#e74c3c' : (severity === 'medium' ? '#f39c12' : '#27ae60');
  }
}
```

### How It Works - Step by Step

**Example**: User clicks "High" button

```
Step 1: Function called
  setSeverityScreen('high')

Step 2: Store state
  state.severity = 'high'
  userSelectedSeverity = 'high'
  console.log('Severity set to: high')

Step 3: Reset all buttons
  Query all buttons with id starting with "severity-"
    [severity-low, severity-medium, severity-high]
  
  For each button:
    border: gray-light (light gray)
    background: white
    color: primary-dark (dark blue)

  After reset:
  ┌─────────────┬─────────────┬─────────────┐
  │   🟢 Low    │   🟡 Med    │   🔴 High   │
  │ (white bg)  │ (white bg)  │ (white bg)  │
  └─────────────┴─────────────┴─────────────┘

Step 4: Highlight selected button
  selectedBtn = document.getElementById('severity-high')
  
  Since severity === 'high':
    borderColor = '#e74c3c' (RED)
    background = 'rgba(231, 76, 60, 0.1)' (LIGHT RED)
    color = '#e74c3c' (RED TEXT)

Step 5: Final state
  ┌─────────────┬─────────────┬─────────────┐
  │   🟢 Low    │   🟡 Med    │  ┌─────────┐│
  │ (white bg)  │ (white bg)  │  │ 🔴 High ││
  │             │             │  │(red bg) ││
  │             │             │  └─────────┘│
  └─────────────┴─────────────┴─────────────┘
```

### Example Styling Applied

**For 'high':**
```css
borderColor: "#e74c3c"              /* Red border */
background: "rgba(231, 76, 60, 0.1)" /* Light red background */
color: "#e74c3c"                    /* Red text */
```

**For 'medium':**
```css
borderColor: "#f39c12"              /* Orange border */
background: "rgba(243, 156, 18, 0.1)" /* Light orange background */
color: "#f39c12"                    /* Orange text */
```

**For 'low':**
```css
borderColor: "#27ae60"              /* Green border */
background: "rgba(39, 174, 96, 0.1)" /* Light green background */
color: "#27ae60"                    /* Green text */
```

---

## 6. Data Configuration

### City Locations Object
```javascript
const cityLocations = {
  'bangalore': { count: 5, code: '80', region: 'Bangalore' },
  'mumbai': { count: 7, code: '22', region: 'Mumbai' },
  'delhi': { count: 8, code: '11', region: 'Delhi' },
  'hyderabad': { count: 6, code: '40', region: 'Hyderabad' },
  'chennai': { count: 5, code: '44', region: 'Chennai' },
  'pune': { count: 4, code: '20', region: 'Pune' },
  'eluru': { count: 3, code: '83', region: 'Eluru' },
  'kakinada': { count: 5, code: '84', region: 'Kakinada' },
  'vizag': { count: 6, code: '89', region: 'Visakhapatnam' },
  'visakhapatnam': { count: 6, code: '89', region: 'Visakhapatnam' },
  'vijayawada': { count: 4, code: '86', region: 'Vijayawada' },
  'rajahmundry': { count: 3, code: '83', region: 'Rajahmundry' },
  'tirupati': { count: 4, code: '89', region: 'Tirupati' },
  'gurgaon': { count: 6, code: '12', region: 'Gurgaon' },
  'noida': { count: 5, code: '12', region: 'Noida' },
  'jaipur': { count: 4, code: '14', region: 'Jaipur' }
};
```

### Hospital Name Prefixes
```javascript
const hospitalNamePrefixes = [
  'Apollo', 'Fortis', 'Max', 'Columbia', 'Narayana', 'Manipal',
  'Indraprastha', 'Care', 'United', 'Prime', 'City', 'Healing',
  'Royal', 'Star', 'Sacred', 'Sunrise', 'Wellness', 'Life',
  'Divine', 'Health', 'Mercy', 'Grace', 'Victory', 'Trust',
  'Modern', 'Advanced', 'Global', 'National', 'Federal', 'Bright'
];
```

### Hospital Name Suffixes
```javascript
const hospitalNameSuffixes = [
  'Hospital', 'Clinic', 'Healthcare', 'Medical Center',
  'Care Center', 'Nursing Home', 'Diagnostic Center',
  'Health Institute', 'Medical Institute', 'Medical Complex',
  'Medical Services', 'Wellness Center'
];
```

### Medical Specialties
```javascript
const specialities = [
  'Multi-specialty', 'Cardiology', 'Orthopedics', 'Neurology',
  'Pediatrics', 'General Practice', 'Oncology', 'Gastroenterology',
  'ENT', 'Ophthalmology', 'Dermatology', 'Psychiatry',
  'Pulmonology', 'Nephrology', 'Rheumatology', 'Immunology',
  'Urology', 'Gynecology', 'Emergency Care', 'Trauma Center',
  'Maternity', 'Dental', 'ICU', 'General Surgery'
];
```

---

## 7. Integration Points

### Where These Functions Are Called

```
User Interface
    ↓
(User clicks severity button)
    ↓
setSeverityScreen('high')
    ↓
Button highlights with red

---

User Interface
    ↓
(User clicks "Find Hospitals & Clinics")
    ↓
openHospitalSearchPanel()
    ↓
showDefaultHospitals()
    ↓
generateDefaultHospitals()  [generates 5 random hospitals]
    ↓
displayHospitals(hospitals) [shows on screen]

---

User Interface
    ↓
(User enters "Kakinada" and clicks Search)
    ↓
searchHospitalsByAddress()
    ↓
generateHospitalsForLocation("kakinada")  [generates 5 hospitals]
    ↓
displayHospitals(hospitals) [shows on screen]

---

User Interface
    ↓
(User selects "Bangalore" from dropdown)
    ↓
searchHospitalsByCity()
    ↓
generateHospitalsForLocation("bangalore")  [generates 5 hospitals]
    ↓
displayHospitals(hospitals) [shows on screen]
```

---

## 8. Performance Considerations

### Time Complexity
```
generateHospitalsForLocation(location):
  - Lookup: O(1)
  - Loop count times: O(n) where n = hospital count
  - Name generation: O(1)
  - Total: O(n) → O(5) to O(8) = Fast!
```

### Memory Usage
```
cityLocations object: ~1KB
hospitalNamePrefixes: ~2KB
hospitalNameSuffixes: ~1KB
specialities: ~2KB
Generated hospitals array: ~1-2KB per search
Total: Very minimal
```

### Randomization
```
Each search generates:
  - 3 to 8 hospital objects (depending on location)
  - ~0.5-1 millisecond execution time
  - Fresh random data each time
  - No API calls needed
```

---

**Implementation complete and optimized for performance!** ⚡
