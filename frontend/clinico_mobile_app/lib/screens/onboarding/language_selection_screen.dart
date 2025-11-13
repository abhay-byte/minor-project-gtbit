import 'package:flutter/material.dart';
import 'onboarding_screen.dart';

class LanguageSelectionScreen extends StatefulWidget {
  @override
  _LanguageSelectionScreenState createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  String selectedLanguage = 'English';
  TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    filteredLanguages = allLanguages;
    searchController.addListener(_filterLanguages);
  }

  void _filterLanguages() {
    String query = searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        filteredLanguages = allLanguages;
      } else {
        filteredLanguages = allLanguages.where((language) {
          return language['name']!.toLowerCase().contains(query) ||
              language['native']!.toLowerCase().contains(query);
        }).toList();
      }
    });
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  List<Map<String, String>> allLanguages = [
    {'name': 'English', 'native': ''},
    {'name': 'Hindi', 'native': 'हिन्दी'},
    {'name': 'Bengali', 'native': 'বাংলা'},
    {'name': 'Telugu', 'native': 'తెలుగు'},
    {'name': 'Marathi', 'native': 'मराठी'},
    {'name': 'Tamil', 'native': 'தமிழ்'},
    {'name': 'Urdu', 'native': 'اُردُو'},
    {'name': 'Gujarati', 'native': 'ગુજરાતી'},
    {'name': 'Kannada', 'native': 'ಕನ್ನಡ'},
    {'name': 'Odia', 'native': 'ଓଡ଼ିଆ'},
    {'name': 'Malayalam', 'native': 'മലയാളം'},
    {'name': 'Punjabi', 'native': 'ਪੰਜਾਬੀ'},
    {'name': 'Assamese', 'native': 'অসমীয়া'},
    {'name': 'Maithili', 'native': 'मैथिली'},
    {'name': 'Bhojpuri', 'native': 'भोजपुरी'},
    {'name': 'Santali', 'native': 'ᱥᱟᱱᱛᱟᱲᱤ'},
    {'name': 'Kashmiri', 'native': 'کٲشُر'},
    {'name': 'Nepali', 'native': 'नेपाली'},
    {'name': 'Sindhi', 'native': 'سنڌي'},
    {'name': 'Dogri', 'native': 'डोगरी'},
    {'name': 'Konkani', 'native': 'कोंकणी'},
    {'name': 'Manipuri', 'native': 'মৈতৈলোন্'},
    {'name': 'Bodo', 'native': 'बड़ो'},
    {'name': 'Sanskrit', 'native': 'संस्कृतम्'},
    {'name': 'Haryanvi', 'native': 'हरियाणवी'},
    {'name': 'Rajasthani', 'native': 'राजस्थानी'},
    {'name': 'Chhattisgarhi', 'native': 'छत्तीसगढ़ी'},
    {'name': 'Awadhi', 'native': 'अवधी'},
    {'name': 'Magahi', 'native': 'मगही'},
    {'name': 'Marwari', 'native': 'मारवाड़ी'},
    {'name': 'Tulu', 'native': 'ತುಳು'},
    {'name': 'Kurukh', 'native': 'कुड़ुख़'},
    {'name': 'Khasi', 'native': 'কাসি'},
    {'name': 'Garo', 'native': 'আচিক'},
    {'name': 'Mizo', 'native': 'Mizo ṭawng'},
    {'name': 'Nagamese', 'native': 'Nagamese'},
  ];

  List<Map<String, String>> filteredLanguages = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF5F5F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 40),

              // Header Title
              SizedBox(
                width: 325,
                child: Text(
                  'Choose the language',
                  style: TextStyle(
                    color: Color(0xFF12110D),
                    fontSize: 28,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              SizedBox(height: 12),

              // Header Subtitle
              SizedBox(
                width: 325,
                child: Text(
                  'Select your preferred language below This helps us serve you better.',
                  style: TextStyle(
                    color: Color(0xFF5A5E60),
                    fontSize: 14,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),

              SizedBox(height: 32),

              // You Selected Title
              SizedBox(
                width: 325,
                child: Text(
                  'You Selected',
                  style: TextStyle(
                    color: Color(0xFF12110D),
                    fontSize: 16,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              SizedBox(height: 12),

              // Selected Language Container
              Container(
                width: double.infinity,
                height: 56,
                padding: EdgeInsets.symmetric(horizontal: 20),
                decoration: ShapeDecoration(
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    side: BorderSide(
                      width: 1.5,
                      color: Color(0xFF248BEB),
                    ),
                    borderRadius: BorderRadius.circular(40),
                  ),
                  shadows: [
                    BoxShadow(
                      color: Color(0x1412110D),
                      blurRadius: 13.81,
                      offset: Offset(0, 0),
                      spreadRadius: 0,
                    )
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      selectedLanguage,
                      style: TextStyle(
                        color: Color(0xFF12110D),
                        fontSize: 15,
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    Container(
                      width: 20,
                      height: 20,
                      decoration: ShapeDecoration(
                        color: Color(0xFF248BEB),
                        shape: CircleBorder(),
                      ),
                      child: Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 14,
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 32),

              // All Languages Title
              SizedBox(
                width: 325,
                child: Text(
                  'All Languages',
                  style: TextStyle(
                    color: Color(0xFF12110D),
                    fontSize: 16,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              SizedBox(height: 12),

              // Language List Container
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x0A000000),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Search Bar
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Container(
                          height: 48,
                          decoration: BoxDecoration(
                            color: Color(0xFFF5F5F5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: TextField(
                            controller: searchController,
                            decoration: InputDecoration(
                              hintText: 'Search',
                              hintStyle: TextStyle(
                                color: Color(0xFF9E9E9E),
                                fontSize: 15,
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                color: Color(0xFF9E9E9E),
                                size: 24,
                              ),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ),

                      // Language List
                      Expanded(
                        child: ListView.builder(
                          padding: EdgeInsets.zero,
                          itemCount: filteredLanguages.length,
                          itemBuilder: (context, index) {
                            bool isSelected = filteredLanguages[index]['name'] == selectedLanguage;
                            return InkWell(
                              onTap: () {
                                setState(() {
                                  selectedLanguage = filteredLanguages[index]['name']!;
                                });
                              },
                              child: Container(
                                height: 60,
                                decoration: BoxDecoration(
                                  color: isSelected ? Color(0xFFD6F1FF) : Colors.white,
                                ),
                                padding: EdgeInsets.symmetric(horizontal: 20),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      filteredLanguages[index]['native']!.isEmpty
                                          ? filteredLanguages[index]['name']!
                                          : '${filteredLanguages[index]['name']} (${filteredLanguages[index]['native']})',
                                      style: TextStyle(
                                        color: Color(0xFF12110D),
                                        fontSize: 15,
                                        fontFamily: 'Roboto',
                                        fontWeight: FontWeight.w400,
                                      ),
                                    ),
                                    Container(
                                      width: 20,
                                      height: 20,
                                      decoration: ShapeDecoration(
                                        color: isSelected ? Color(0xFF248BEB) : Colors.transparent,
                                        shape: CircleBorder(
                                          side: BorderSide(
                                            width: 1.5,
                                            color: isSelected ? Color(0xFF248BEB) : Color(0xFFE6E6E6),
                                          ),
                                        ),
                                      ),
                                      child: isSelected
                                          ? Icon(
                                        Icons.check,
                                        color: Colors.white,
                                        size: 14,
                                      )
                                          : null,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SizedBox(height: 24),

              // Continue Button
              GestureDetector(
                onTap: () {
                  // Navigate to onboarding screen
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => OnboardingScreen()),
                  );
                },
                child: Container(
                  width: double.infinity,
                  height: 56,
                  decoration: ShapeDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF248BEB), Color(0xFF1976D2)],
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    shadows: [
                      BoxShadow(
                        color: Color(0x40248BEB),
                        blurRadius: 12,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Continue',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),

              SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}