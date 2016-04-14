#sudo docker build -t vincentsshkeys .
FROM ubuntu
RUN sudo apt-get update && apt-get upgrade -y
RUN sudo apt-get install ansible -y
RUN sudo apt-get install openssh-server -y
RUN mkdir /var/run/sshd
RUN sudo  useradd -m -G sudo vincent
RUN echo 'vincent:pass' | chpasswd
RUN mkdir /home/vincent/.ssh
COPY ./authorized_keys /home/vincent/.ssh/
RUN chown -R vincent:vincent /home/vincent
RUN chmod 400 /home/vincent/.ssh/authorized_keys
RUN chmod 700 /home/vincent/.ssh
# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]