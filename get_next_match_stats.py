from bs4 import BeautifulSoup
import requests
import pandas as pd
import re
import time
import json
import sys
import warnings
import torch
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
# from matplotlib import pyplot as plt
import numpy as np


with open("names_and_links_dictionary.json", 'r') as file:
    names_and_links_dictionary = json.load(file)


list_of_positions = ['FW', 'RM', 'GK', 'DM', 'RW', 'FW,LW', 'LW', 'CB', 'CM', 'RM,CB,LM', 'LB', 'LM', 'AM', 'WB', 'RB', 'FW,CM', 'CM,DM', 'RM,CM', 'LW,AM', 'FW,AM', 'CM,RM', 'LW,FW', 'FW,RW', 'CB,CM', 'DM,CM', 'AM,LW', 'LM,FW', 'LW,FW,RW', 'RW,RM,AM', 'CM,RM,AM', 'LB,CB', 'LM,LW', 'DM,RM', 'CM,RW', 'WB,RB', 'AM,FW', 'RW,FW', 'RW,RB', 'RW,RM', 'RM,LM', 'CB,RB', 'RW,LB,WB', 'LW,LM', 'CM,LB', 'RW,AM', 'RW,WB', 'LW,RW', 'RW,CM', 'RM,CB', 'LM,RM', 'CM,LM,DM', 'WB,LB', 'CM,FW', 'RW,LW', 'LM,CM', 'RB,CB', 'CM,LM', 'RM,AM', 'FW,DM', 'LM,RW', 'LB,LM', 'RB,RM', 'DM,AM', 'AM,LM', 'RW,LM', 'LW,LB']

teams = ["Luton Town", "Sheffield Utd", "Burnley", "Everton", "Nott'ham Forest", "Bournemouth",  "West Ham", "Wolves", "Chelsea", "Crystal Palace", "Fulham", "Brentford", "Tottenham", "Aston Villa", "Brighton", "Liverpool", "Newcastle Utd", "Manchester Utd", "Arsenal", "Manchester City"]

win_draw_loss = ["W", "L", "D"]


def get_next_match_stats(name):
    if name in names_and_links_dictionary:

        warnings.filterwarnings("ignore", category=FutureWarning)

        name_url = names_and_links_dictionary[name]

        response = requests.get(name_url)

        if response.status_code == 200:
            html_content = response.text

        else:
            print(f"\n SERVER RESPONSE: {response.status_code}")
            print(f"RETRY AFTER: {response.headers.get('Retry-After')}")

        soup = BeautifulSoup(html_content, 'html.parser')

        table = soup.find("table", {"id": "last_5_matchlogs"})

        if table:
            df = pd.read_html(str(table))[0]

            match_stats = []
            for index, row in df.iterrows():
                current_row = row.tolist()
                current_row = current_row[3:-1]
                # print(current_row)

                if current_row[5] == "GK":
                    return "No goalkeepers."

                if len(current_row) != 32:
                    return "This player does not have enough data on their 5 previous matches"


                if current_row[5] == "On matchday squad, but did not play":

                    home_or_away = torch.tensor([0])

                    if current_row[0] == "Home":
                        home_or_away = torch.tensor([1])
                    elif current_row[0] == "Away":
                        home_or_away = torch.tensor([0])

                    start_or_bench = torch.tensor([0])
                    if current_row[4] == "Y" or current_row[4] == "Y*":
                        start_or_bench = torch.tensor([1])
                    elif current_row[4] == "N":
                        start_or_bench = torch.tensor([0])

                    categorical_player_data_vector = [current_row[1][0], current_row[2], current_row[3]]
                    one_hot_encoded = [
                        torch.tensor([
                            int(category == element) for category in category_list
                        ]) for element, category_list in zip(categorical_player_data_vector, [win_draw_loss, teams, teams])
                    ]

                    zero_vect = torch.zeros(66)
                    one_hot_encoded.append(zero_vect)
                    one_hot_encoded.insert(0, home_or_away)
                    one_hot_encoded.insert(2, start_or_bench)

                    second_zero_vect = torch.zeros(26)


                    one_hot_encoded.append(second_zero_vect)

                    # print(one_hot_encoded)

                    concatenated_one_hot_categorical = torch.cat(one_hot_encoded)

                    match_stats.append(concatenated_one_hot_categorical)
                    # print(concatenated_one_hot_categorical)



                elif current_row[5] != "On matchday squad, but did not play":

                    home_or_away = torch.tensor([0])
                    if current_row[0] == "Home":
                        home_or_away = torch.tensor([1])
                    elif current_row[0] == "Away":
                        home_or_away = torch.tensor([0])

                    start_or_bench = torch.tensor([0])
                    if current_row[4] == "Y" or current_row[4] == "Y*":
                        start_or_bench = torch.tensor([1])
                    elif current_row[4] == "N":
                        start_or_bench = torch.tensor([0])

                    categorical_player_data_vector = [current_row[1][0], current_row[2], current_row[3], current_row[5]]
                    one_hot_encoded = [
                        torch.tensor([
                            int(category == element) for category in category_list
                        ]) for element, category_list in zip(categorical_player_data_vector, [win_draw_loss, teams, teams, list_of_positions])
                    ]

                    numerical_match_data_vector = current_row[-26:]
                    numerical_match_data_vector = [float(element) for element in numerical_match_data_vector]

                    one_hot_encoded.insert(0, home_or_away)
                    one_hot_encoded.insert(2, start_or_bench)

                    one_hot_encoded.append(torch.tensor(numerical_match_data_vector))

                    # print(one_hot_encoded)
                    concatenated_one_hot_categorical = torch.cat(one_hot_encoded)

                    match_stats.append(concatenated_one_hot_categorical)
                    # print(concatenated_one_hot_categorical)
                    # print(torch.numel(concatenated_one_hot_categorical))
        else:
            return "no table found, this player has not played 5 consecutive matches"

    match_stats.reverse()
    matches_sequence = torch.stack(match_stats)
    # print(matches_sequence)


    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


    input_size = 137  # Number of features in each time step of the input sequence
    hidden_size = 200  # Number of units in the hidden state of the RNN
    num_layers = 2  # Number of recurrent layers in the RNN
    output_size = 31  # Number of features in the output tensor

    batch_size = 32
    learning_rate = 0.0003
    num_epochs = 30

    class RNNModel(nn.Module):
        def __init__(self, input_size, hidden_size, num_layers, output_size):
            super(RNNModel, self).__init__()
            self.hidden_size = hidden_size
            self.num_layers = num_layers
            
            # Define the RNN layer
            self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
            # self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)

            # Define the output layer
            self.fc1 = nn.Linear(hidden_size, 128)
            self.fc2 = nn.Linear(128, output_size)
            self.relu = nn.ReLU()
            
        def forward(self, x):
            # Initialize hidden state with zeros
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            # for RNN, comment out c0
            # c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

            # Forward propagate RNN
            out, _ = self.rnn(x, h0)
            # out, _ = self.lstm(x, (h0, c0))
            
            # Decode the hidden state of the last time step
            out = self.fc1(out[:, -1, :])
            out = self.fc2(out)
            out=self.relu(out)
            return out



    model = RNNModel(input_size, hidden_size, num_layers, output_size)
    model.to(device) 
    # Load the saved weights into the model
    model.load_state_dict(torch.load('weights.pth'))

    # Set the model to evaluation mode

    new_data_tensor = matches_sequence.unsqueeze(0)
    #new_data_tensor.unsqueeze(0)
    #print(new_data_tensor)

    new_data_tensor = new_data_tensor.to(device)

    model.eval()

    with torch.no_grad():
        output = model(new_data_tensor)

    # Convert the output tensor to numpy array if needed
    predicted_values = output.cpu().numpy()

    return predicted_values.tolist()

print(get_next_match_stats("Erling-Haaland"))



from flask import Flask, send_file
import json
from os.path import join
import os 
dir = os.path.dirname(os.path.realpath(__file__))

app = Flask("test", static_folder= "static")

@app.route("/api/<name>")
def hello_world(name):
    return json.dumps({"name": name, "results": get_next_match_stats(name)})

@app.route("/<path:filename>")
def aaa(filename):
    
    s = join(dir, join("./static", filename))
    print(s)
    
    try:
        return send_file(s, as_attachment = False)
    except Exception as err:
        print(err)

app.run()