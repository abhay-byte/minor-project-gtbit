import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_bloc.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_event.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_state.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/widgets/search_bar_widget.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/widgets/doctor_card.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/widgets/doctor_map_view.dart';

class DoctorSearchScreen extends StatefulWidget {
  const DoctorSearchScreen({Key? key}) : super(key: key);

  @override
  _DoctorSearchScreenState createState() => _DoctorSearchScreenState();
}

class _DoctorSearchScreenState extends State<DoctorSearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLightBlue,
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            SearchBarWidget(
              controller: _searchController,
              onFilterTap: () {
                // TODO: Implement filter functionality
              },
              onSubmitted: (query) {
                context.read<DoctorSearchBloc>().add(
                  SearchDoctorsEvent(
                    query: query,
                    latitude: 0, // TODO: Get actual location
                    longitude: 0,
                  ),
                );
              },
            ),

            // Map and Doctor List
            Expanded(
              child: BlocBuilder<DoctorSearchBloc, DoctorSearchState>(
                builder: (context, state) {
                  if (state is DoctorSearchLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (state is DoctorSearchSuccess) {
                    if (state.doctors.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off_rounded,
                              size: 64,
                              color: AppColors.textLightGrey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No doctors found',
                              style: AppTextStyles.bodyLarge.copyWith(
                                color: AppColors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      );
                    }
                    return Column(
                      children: [
                        // Map View
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: DoctorMapView(
                            doctors: state.doctors,
                            onDoctorSelected: (doctor) {
                              context.read<DoctorSearchBloc>().add(
                                GetDoctorDetailsEvent(doctor.id),
                              );
                            },
                          ),
                        ),
                        // Doctor List
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.only(top: 8),
                            itemCount: state.doctors.length,
                            itemBuilder: (context, index) {
                              final doctor = state.doctors[index];
                              return DoctorCard(
                                doctor: doctor,
                                onTap: () {
                                  context.read<DoctorSearchBloc>().add(
                                    GetDoctorDetailsEvent(doctor.id),
                                  );
                                },
                              );
                            },
                          ),
                        ),
                      ],
                    );
                  } else if (state is DoctorSearchError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline_rounded,
                            size: 64,
                            color: AppColors.textLightGrey,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            state.message,
                            style: AppTextStyles.bodyLarge.copyWith(
                              color: AppColors.textGrey,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_rounded,
                          size: 64,
                          color: AppColors.textLightGrey,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Search for doctors',
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.textGrey,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
