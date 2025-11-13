import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_bloc.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_event.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_state.dart';
import 'package:intl/intl.dart';

class AppointmentBookingScreen extends StatefulWidget {
  final Doctor doctor;

  const AppointmentBookingScreen({Key? key, required this.doctor})
    : super(key: key);

  @override
  _AppointmentBookingScreenState createState() =>
      _AppointmentBookingScreenState();
}

class _AppointmentBookingScreenState extends State<AppointmentBookingScreen> {
  late DateTime _selectedDate;
  String? _selectedTimeSlot;
  final TextEditingController _descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _fetchAvailableSlots();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _fetchAvailableSlots() {
    context.read<DoctorSearchBloc>().add(
      GetAvailableSlotsEvent(doctorId: widget.doctor.id, date: _selectedDate),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWhite,
      appBar: AppBar(
        backgroundColor: AppColors.primaryLightBlue,
        title: Text('Book Appointment', style: AppTextStyles.heading1),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Doctor Info Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgLightBlue,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(widget.doctor.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.doctor.name, style: AppTextStyles.heading2),
                        const SizedBox(height: 4),
                        Text(
                          widget.doctor.specialization,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textLightGrey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Consultation Fee: ₹${widget.doctor.consultationFee}',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.primaryLightBlue,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Date Selection
            Text('Select Date', style: AppTextStyles.heading2),
            const SizedBox(height: 16),
            Container(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 7,
                itemBuilder: (context, index) {
                  final date = DateTime.now().add(Duration(days: index));
                  final isSelected =
                      _selectedDate.year == date.year &&
                      _selectedDate.month == date.month &&
                      _selectedDate.day == date.day;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedDate = date;
                        _selectedTimeSlot = null;
                      });
                      _fetchAvailableSlots();
                    },
                    child: Container(
                      width: 70,
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primaryLightBlue
                            : AppColors.bgLightBlue,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            DateFormat('EEE').format(date),
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textGrey,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            DateFormat('d').format(date),
                            style: AppTextStyles.heading2.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textGrey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Time Slots
            Text('Available Time Slots', style: AppTextStyles.heading2),
            const SizedBox(height: 16),
            BlocBuilder<DoctorSearchBloc, DoctorSearchState>(
              builder: (context, state) {
                if (state is AvailableSlotsLoading) {
                  return const Center(child: CircularProgressIndicator());
                } else if (state is AvailableSlotsSuccess) {
                  if (state.slots.isEmpty) {
                    return Center(
                      child: Text(
                        'No slots available for this date',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textLightGrey,
                        ),
                      ),
                    );
                  }
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: state.slots.map((slot) {
                      final isSelected = slot == _selectedTimeSlot;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedTimeSlot = slot;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primaryLightBlue
                                : AppColors.bgLightBlue,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            slot,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textGrey,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  );
                } else if (state is AvailableSlotsError) {
                  return Center(
                    child: Text(
                      state.message,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textLightGrey,
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            const SizedBox(height: 24),

            // Description
            Text('Description (Optional)', style: AppTextStyles.heading2),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Write your symptoms or any notes for the doctor...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textLightGrey,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.borderGrey),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.borderGrey),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.primaryLightBlue),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Book Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _selectedTimeSlot != null
                    ? () {
                        final dateTime = DateTime(
                          _selectedDate.year,
                          _selectedDate.month,
                          _selectedDate.day,
                          // Parse time from selected slot
                          int.parse(_selectedTimeSlot!.split(':')[0]),
                          int.parse(_selectedTimeSlot!.split(':')[1]),
                        );

                        context.read<DoctorSearchBloc>().add(
                          BookAppointmentEvent(
                            doctorId: widget.doctor.id,
                            dateTime: dateTime,
                            patientId: 'current_user_id', // TODO: Get from auth
                            description: _descriptionController.text,
                          ),
                        );
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryLightBlue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text('Confirm Booking', style: AppTextStyles.buttonText),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
