import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@services/data/user.service';
import { TeamService } from '@services/data/team.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team-setting',
  templateUrl: './team-setting.component.html',
  styleUrls: ['./team-setting.component.scss'],
})
export class TeamSettingComponent implements OnInit {
  constructor(private teamService: TeamService, private userService: UserService, private toastr: ToastrService) {}

  invitedUsers: any = [];
  loading: Boolean = false;

  inviteForm = new FormGroup({
    inviteInput: new FormArray([new FormControl('')]),
  });

  async getMembers() {
    const response = await this.teamService.getAll({
      filters: { user: { id: { $eq: this.userService.user?.id } } },
    });
    return response;
  }

  async ngOnInit() {
    this.invitedUsers = await this.getMembers();
    console.log(this.invitedUsers);
  }
  addInput() {
    this.inviteForm.controls.inviteInput.push(new FormControl(''));
  }
  async sendInvite() {
    const email: any = this.inviteForm.value.inviteInput;

    let users: any = [];
    for (let item of email) {
      const user = await this.userService.getOne({
        filters: {
          // id: { $eq: 899898 },
          // // founders: {
          // //   user: {
          // //     id: { $eq: this.userService.user?.id },
          // //   },
          // // },
          email: item,
        },
        populate: {
          logo: {
            fields: ['url'],
          },
          industries: true,
          topics: true,
          founders: true,
        },
      });
      if (user[0]?.id) {
        users.push(user[0]);
      } else {
        this.toastr.error(item + ' is not a valid email');
        users = false;
        break;
      }
    }

    if (users) {
      for (let item of users) {
        const checkMail = await this.teamService.getOne({
          filters: { email: { $eq: item.email } },
        });
        if (checkMail.data[0]?.id) {
          this.toastr.error(item.email + ' this user is already invited');
          return;
        } else {
          const response = await this.teamService.create({
            name: item.username,
            email: item.email,
            user: this.userService.user?.id,
            status: 'pending',
          });
          console.log(response);
        }
      }
    } else {
      return;
    }

    this.invitedUsers = await this.getMembers();

    this.toastr.success('Invited Sucessfully ');
  }

  async deleteMember(id: any) {
    this.loading = true;
    const response = await this.teamService.delete(id);
    this.invitedUsers = await this.getMembers();
    this.loading = false;

    //
  }
}
