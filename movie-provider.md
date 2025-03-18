## Provider Data

### Details

TMDB paired with JustWatch to display provider data for movies based on each country.

### JSON Structure

```
{
  "id": 123456,  // Movie ID
  "results": {
    "AE": { /* provider data */ },
    "AL": { /* provider data */ },
    "AR": { /* provider data */ },
    "AT": { /* provider data */ },
    "AU": { /* provider data */ },
    "BA": { /* provider data */ },
    "BB": { /* provider data */ },
    "BE": { /* provider data */ },
    "BG": { /* provider data */ },
    "BH": { /* provider data */ },
    "BO": { /* provider data */ },
    "BR": { /* provider data */ },
    "BS": { /* provider data */ },
    "CA": { /* provider data */ },
    "CH": { /* provider data */ },
    "CL": { /* provider data */ },
    "CO": { /* provider data */ },
    "CR": { /* provider data */ },
    "CV": { /* provider data */ },
    "CZ": { /* provider data */ },
    "DE": { /* provider data */ },
    "DK": { /* provider data */ },
    "DO": { /* provider data */ },
    "EC": { /* provider data */ },
    "EE": { /* provider data */ },
    "EG": { /* provider data */ },
    "ES": { /* provider data */ },
    "FI": { /* provider data */ },
    "FJ": { /* provider data */ },
    "FR": { /* provider data */ },
    "GB": { /* provider data */ },
    "GF": { /* provider data */ },
    "GI": { /* provider data */ },
    "GR": { /* provider data */ },
    "GT": { /* provider data */ },
    "HK": { /* provider data */ },
    "HN": { /* provider data */ },
    "HR": { /* provider data */ },
    "HU": { /* provider data */ },
    "ID": { /* provider data */ },
    "IE": { /* provider data */ },
    "IL": { /* provider data */ },
    "IN": { /* provider data */ },
    "IQ": { /* provider data */ },
    "IS": { /* provider data */ },
    "IT": { /* provider data */ },
    "JM": { /* provider data */ },
    "JO": { /* provider data */ },
    "JP": { /* provider data */ },
    "KR": { /* provider data */ },
    "KW": { /* provider data */ },
    "LB": { /* provider data */ },
    "LI": { /* provider data */ },
    "LT": { /* provider data */ },
    "LV": { /* provider data */ },
    "MD": { /* provider data */ },
    "MK": { /* provider data */ },
    "MT": { /* provider data */ },
    "MU": { /* provider data */ },
    "MX": { /* provider data */ },
    "MY": { /* provider data */ },
    "MZ": { /* provider data */ },
    "NL": { /* provider data */ },
    "NO": { /* provider data */ },
    "NZ": { /* provider data */ },
    "OM": { /* provider data */ },
    "PA": { /* provider data */ },
    "PE": { /* provider data */ },
    "PH": { /* provider data */ },
    "PK": { /* provider data */ },
    "PL": { /* provider data */ },
    "PS": { /* provider data */ },
    "PT": { /* provider data */ },
    "PY": { /* provider data */ },
    "QA": { /* provider data */ },
    "RO": { /* provider data */ },
    "RS": { /* provider data */ },
    "RU": { /* provider data */ },
    "SA": { /* provider data */ },
    "SE": { /* provider data */ },
    "SG": { /* provider data */ },
    "SI": { /* provider data */ },
    "SK": { /* provider data */ },
    "SM": { /* provider data */ },
    "SV": { /* provider data */ },
    "TH": { /* provider data */ },
    "TR": { /* provider data */ },
    "TT": { /* provider data */ },
    "TW": { /* provider data */ },
    "UG": { /* provider data */ },
    "US": { /* provider data */ },
    "UY": { /* provider data */ },
    "VE": { /* provider data */ },
    "YE": { /* provider data */ },
    "ZA": { /* provider data */ }
  }
}
```

### Provider Data Structure

```
{
  // Example for Spain (ES) which has one of the most complete provider data structures
  // Some countries may have fewer provider types (e.g., only flatrate, or only buy options)
  "ES": {
    "link": "https://www.themoviedb.org/movie/123456-movie-title/watch?locale=ES",
    
    // Subscription streaming services
    "flatrate": [
      {
        "logo_path": "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg",
        "provider_id": 8,
        "provider_name": "Netflix",
        "display_priority": 0
      },
      {
        "logo_path": "/5NyLm42TmCqCMOZFvH4fcoSNKEW.jpg",
        "provider_id": 337,
        "provider_name": "Disney Plus",
        "display_priority": 1
      },
      {
        "logo_path": "/3zw1hrsNOdLcHxj8sYJHL8UvL2Y.jpg",
        "provider_id": 119,
        "provider_name": "Amazon Prime Video",
        "display_priority": 2
      }
    ],
    
    // Rental options
    "rent": [
      {
        "logo_path": "/peURlLlr8jggOwK53fJ5wdQl05y.jpg",
        "provider_id": 2,
        "provider_name": "Apple TV",
        "display_priority": 0
      },
      {
        "logo_path": "/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg",
        "provider_id": 3,
        "provider_name": "Google Play Movies",
        "display_priority": 1
      },
      {
        "logo_path": "/5GEbAhFW2S5T8zVc1MNvz00pIzM.jpg",
        "provider_id": 35,
        "provider_name": "Rakuten TV",
        "display_priority": 2
      }
    ],
    
    // Purchase options
    "buy": [
      {
        "logo_path": "/peURlLlr8jggOwK53fJ5wdQl05y.jpg",
        "provider_id": 2,
        "provider_name": "Apple TV",
        "display_priority": 0
      },
      {
        "logo_path": "/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg",
        "provider_id": 3,
        "provider_name": "Google Play Movies",
        "display_priority": 1
      },
      {
        "logo_path": "/5GEbAhFW2S5T8zVc1MNvz00pIzM.jpg",
        "provider_id": 35,
        "provider_name": "Rakuten TV",
        "display_priority": 2
      }
    ],
    
    // Free with ads (only available in some countries)
    "ads": [
      {
        "logo_path": "/8V7i31voizkPrOTilJgi9ttYmKL.jpg",
        "provider_id": 146,
        "provider_name": "Movistar Plus",
        "display_priority": 0
      },
      {
        "logo_path": "/pq79bwR1X213TKS8D7sfpGtdbgx.jpg",
        "provider_id": 149,
        "provider_name": "Pluto TV",
        "display_priority": 1
      }
    ]
  }
}
```