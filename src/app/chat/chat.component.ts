import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  results = [];
  formValue: string;
  botid: string;
  mess_obj = {}
  botId: string;
  next_rule: string;
  curr_state: string;
  testvalue: string;
  allstates = {}

  // Inject HttpClient into your component or service.
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.post('http://localhost:7005/getbot_val', { "botId": "BOT2018051818837929" }).subscribe(data => {
      console.log(data);
      this.next_rule = data['mess_data'][0].next_rule;
      this[data["state"]] = {}
      this.curr_state = data["state"];
      this.allstates[data["state"]] = data["state"]

      console.log(this.curr_state, data["state"]);
      var mess_obj = {
        "title": data['mess_data'][0].message.title,
        "sentBy": "bot",
        "suggestion": false
      }
      this.botId = "BOT2018051818837929";
      this.results.push(mess_obj);
    });
  }

  sendMessage() {
    var mess_obj = {
      "title": this.formValue,
      "sentBy": "user"
    }
    this.allstates[this.curr_state] = {
      "answer": this.formValue
    }
    console.log(this.curr_state, this[this.curr_state]);
    this.results.push(mess_obj);
    this.getbotflow();
    this.formValue = '';
  }

  getbotflow() {
    var postdata = {
      "botId": this.botId,
      "state": this.next_rule
    }
    this.http.post('http://localhost:7005/send_value', postdata).subscribe(data => {
      console.log(data);
      for( var j = 0;j<data['mess_data'].length;j++){      
      if (!data['mess_data'][j].message.img) {
        var index = data['mess_data'][j].message.indexOf("{")
        if (index !== -1) {
          var index = data['mess_data'][j].message.indexOf("{")
          var str = data['mess_data'][j].message;
          var found = [];  // an array to collect the strings that are found
          var rxp = /{{([^}]+)}}/g;
          var str = data['mess_data'][j].message;
          var curMatch;
          while (curMatch = rxp.exec(str)) {
            found.push(curMatch[1]);
          }
          for (var i = 0; i < found.length; i++) {
            var newans = this.allstates[found[i]]['answer']
            var state_name = "{{" + found[i] + "}}"
            var newstr = data['mess_data'][j].message.replace(state_name, newans);
          }
          this.mess_obj = {
            "img": false,
            "title": newstr,
            "sentBy": "bot"
          }
        } else {
          this.mess_obj = {
            "img": false,
            "title": data['mess_data'][j].message,
            "sentBy": "bot"
          }
        }
        if (data['mess_data'][j].suggestions) {
          console.log("yes it has options", j, data['mess_data'][j].suggestions)
          this.mess_obj['options'] = data['mess_data'][j].options
          this.mess_obj['suggestions'] = data['mess_data'][j].suggestions
        }
      }
      else {
        this.mess_obj = {
          "title": data['mess_data'][j].message.title,
          "sub_title": data['mess_data'][j].message.subtitle,
          "img_url": data['mess_data'][j].message.img,
          "img": true,
          "sentBy": "bot"
        }
        console.log(data['mess_data'][j], this.mess_obj);
      }
      this.results.push(this.mess_obj);
    }
    });
  }
  sendval(value) {
    console.log(value);
    this.next_rule = value;
    this.getbotflow();
  }
}
